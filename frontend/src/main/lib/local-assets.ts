import archiver from 'archiver';
import { app, shell } from 'electron';
import extract from 'extract-zip';
import { createWriteStream } from 'fs';
import { existsSync } from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { hashElement } from 'folder-hash'

import { DownloadedEntry, Version } from '../../types/ipc';
import { getAuthToken } from './authentication';
import fetchClient from './fetch-client';
import store, { griddleFrontendStore } from './store';

// TODO: clean up error handling here + in message-handlers

export function getDownloadFolder() {
  const downloadPath = griddleFrontendStore.get('storeLocation');

  // Ensure the download folder exists
  if (!existsSync(downloadPath)) {
    fsPromises.mkdir(downloadPath, { recursive: true });
  }

  return downloadPath;
}

export function setDownloadFolder(downloadFolder: string) {
  store.set('downloadFolder', downloadFolder);
}

export function getDownloadedVersions() {
  return store.get('downloadedAssetVersions', []);
}

export function getDownloadedVersionByID(asset_id: string) {
  return getDownloadedVersions().find(({ asset_id: id }) => asset_id === id);
}

function setDownloadedVersion(
  asset_id: string,
  { semver, folderName }: Omit<DownloadedEntry, 'asset_id'>,
) {
  const downloads = store.get('downloadedAssetVersions');

  const newDownloads = [
    ...downloads.filter(({ asset_id: id }) => id !== asset_id),
    { asset_id, semver, folderName },
  ] satisfies DownloadedEntry[];

  store.set('downloadedAssetVersions', newDownloads);
}

export async function getFolderHash(filePath: string): Promise<string>{
  return hashElement(filePath)
  .then(hash => {
    return hash['hash'].toString()
  })
  .catch(error => {
    console.error('hashing failed:', error);
  });
}

export async function ifFilesChanged(assetName: string, asset_id: string): Promise<boolean> {
  // compare current with saved hash 
  const downloads = await getDownloadsJSON()
  const saved_asset = downloads.find((a) => assetName === a.assetName)
  const saved_hash = saved_asset ? saved_asset.folderHash : ""

  // what is the current hash
  const folderName = `${assetName}_${asset_id.substring(0, 8)}/`;
  const folderPath = path.join(getDownloadFolder(), folderName);
  const current_hash = await getFolderHash(folderPath)
  
  console.log('log: ' + current_hash);
  return (current_hash !== saved_hash)
}

export async function getDownloadsJSON(): Promise<{assetName:string, downloadedVersion:string, folderHash:string}[]> {
  try {
    const FD = await fsPromises.open(path.join(getDownloadFolder(), 'downloads.json'), 'r')
    const data = await FD.readFile()
    await FD.close()
    return JSON.parse(data.toString())
  } catch (ENOENT) {
    return []
  }
}

export async function writeDownloadsJSON(updatedDownloadsJSON: {assetName:string, downloadedVersion:string, folderHash:string}[]) {
  const FD = await fsPromises.open(path.join(getDownloadFolder(), 'downloads.json'), 'w+')
  await FD.write(JSON.stringify(updatedDownloadsJSON))
  await FD.close()
}

export async function getFolderHash(filePath: string): Promise<string>{
  return hashElement(filePath)
  .then(hash => {
    return hash['hash'].toString()
  })
  .catch(error => {
    console.error('hashing failed:', error);
  });
}

export async function ifFilesChanged(assetName: string, asset_id: string): Promise<boolean> {
  // compare current with saved hash 
  const downloads = await getDownloadsJSON()
  const saved_asset = downloads.find((a) => assetName === a.assetName)
  const saved_hash = saved_asset ? saved_asset.folderHash : ""

  // what is the current hash
  const folderName = `${assetName}_${asset_id.substring(0, 8)}/`;
  const folderPath = path.join(getDownloadFolder(), folderName);
  const current_hash = await getFolderHash(folderPath)
  
  console.log('log: ' + current_hash);
  return (current_hash !== saved_hash)
}

/**
 * Should be run after POST /api/v1/assets/ to create an empty folder for the asset
 */
export async function createInitialVersion({
  asset_id,
  asset_name,
}: {
  asset_id: string;
  asset_name: string;
}) {
  console.log('making initial version');
  const folderName = `${asset_name}_${asset_id.substring(0, 8)}/`;
  const folderPath = path.join(getDownloadFolder(), folderName);

  console.log('creating folder', folderPath);
  await fsPromises.mkdir(folderPath, { recursive: true });

  console.log('adding to store');
  const newEntry = { asset_id, semver: null, folderName } satisfies DownloadedEntry;

  // hash new folder
  const current_hash = await getFolderHash(folderPath)
  
  setDownloadedVersion(asset_id, { semver: null, folderName, current_hash });
}

export async function openFolder(asset_id: string) {
  const stored = getDownloadedVersionByID(asset_id);
  if (!stored) return;

  shell.openPath(path.join(getDownloadFolder(), stored.folderName));
}

async function zipFolder(sourceFolder: string, zipFilePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
      resolve();
    });

    output.on('end', () => console.log('Data has been drained'));

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn(err);
      } else {
        reject(err);
      }
    });

    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.directory(sourceFolder, false);
    archive.finalize();
  });
}

/**
 * Given an asset name, creates and uploads a new "commit", updating
 * remote and local store to match
 *
 * @returns Downloaded asset list, updated
 */
export async function commitChanges(asset_id: string, message: string, is_major: boolean) {
  const folderName = getDownloadedVersionByID(asset_id)?.folderName;
  console.log('folderName', folderName);

  if (!folderName) {
    throw new Error(`no folder name found for asset with id ${asset_id}`);
  }

  const asset_name = folderName.split("_")[0]

  const sourceFolder = path.join(getDownloadFolder(), folderName);
  const zipFilePath = path.join(app.getPath('temp'), `${asset_id}_commit.zip`);
  console.log('sourceFolder is: ', sourceFolder); // debug log
  console.log('zipFilePath is: ', zipFilePath);

  // Zip up asset folder
  await zipFolder(sourceFolder, zipFilePath);
  const fileContents = await fsPromises.readFile(zipFilePath);
  const fileData = new Blob([fileContents], { type: 'application/zip' });

  // Uploading Zip file with multipart/form-data
  const result = await fetchClient.POST('/api/v1/assets/{uuid}/versions', {
    params: { path: { uuid: asset_id } },
    body: {
      file: fileData as unknown as string,
      message: message,
      is_major: is_major,
    },
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    bodySerializer(body) {
      const formData = new FormData();
      formData.append('file', body.file as unknown as Blob, `${asset_id}_commit.zip`);
      formData.append('message', body.message);
      formData.append('is_major', (body.is_major ?? false).toString());
      return formData;
    },
  });

  const { error, response } = result;

  if (error || !response.ok) {
    console.log('error uploading zip file', error, response.status);
    throw new Error(`Failed to upload zip file for asset ${asset_id}`);
  }

  // Update saved hash
  const new_hash = await getFolderHash(sourceFolder)

  // Update store with currently downloaded version
  const { semver } = result.data as Version;
  setDownloadedVersion(asset_id, { semver, folderName, new_hash });

  // Clean up the zip file
  await fsPromises.rm(zipFilePath);

  return getDownloadedVersions();
}

/**
 * Downloads a specified version of an asset, logging it to the local store.
 *
 * If the asset is already downloaded, it will be overwritten.
 */
export async function downloadVersion({ asset_id, semver }: { asset_id: string; semver: string }) {
  console.log('fetching metadata...');
  let asset_name;
  {
    const { data, error, response } = await fetchClient.GET('/api/v1/assets/{uuid}', {
      params: { path: { uuid: asset_id } },
    });
    if (error || response.status !== 200) {
      throw new Error(`Failed to fetch metadata for asset ${asset_id}`);
    }
    asset_name = data.asset.asset_name;
  }

  console.log('fetching file!');
  const {
    data: fileBlob,
    response,
    error,
  } = await fetchClient.GET('/api/v1/assets/{uuid}/versions/{semver}/file', {
    params: { path: { uuid: asset_id, semver } },
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    parseAs: 'blob',
  });
  if (error || response.status !== 200) {
    throw new Error(`Failed to download asset ${asset_id}`);
  }

  const fileBuffer = Buffer.from(await fileBlob.arrayBuffer());

  console.log('writing!');
  const zipFilePath = path.join(app.getPath('temp'), `${asset_id.substring(0, 8)}_${semver}.zip`);
  fsPromises.writeFile(zipFilePath, fileBuffer);

  console.log('unzipping!');
  // previously had semver in here but probably not necessary
  // const folderName = `${asset_name}_${semver}_${asset_id.substring(0, 8)}/`;
  const folderName = `${asset_name}_${asset_id.substring(0, 8)}/`;
  const folderPath = path.join(getDownloadFolder(), folderName)

  // remove old copy of folder
  await fsPromises.rm(path.join(getDownloadFolder(), folderName), { force: true, recursive: true });
  await extract(zipFilePath, { dir: folderPath });

  console.log('removing zip file...');
  await fsPromises.rm(zipFilePath);

  const current_hash = await getFolderHash(folderPath)
  console.log('marking as stored!');
  setDownloadedVersion(asset_id, { semver, folderName, current_hash });

  console.log('we made it! check', getDownloadFolder());
  return getDownloadedVersions();
}

/**
 * Removes a version from the store and deletes the associated folder
 */
export async function unsyncAsset(asset_id: string) {
  const versions = getDownloadedVersions();

  const stored = versions.find((v) => v.asset_id === asset_id);
  if (!stored) return;

  // delete folder
  const folderPath = path.join(getDownloadFolder(), stored.folderName);
  await fsPromises.rm(folderPath, { recursive: true });

  // remove from store
  const newVersions = versions.filter((v) => v.asset_id !== asset_id);

  store.set('downloadedAssetVersions', newVersions);
}
