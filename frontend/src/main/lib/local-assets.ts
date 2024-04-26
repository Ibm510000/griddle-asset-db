import archiver from 'archiver';
import { app, shell } from 'electron';
import extract from 'extract-zip';
import { createWriteStream } from 'fs';
import { existsSync } from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { hashElement } from 'folder-hash'

import { DownloadedEntry } from '../../types/ipc';
import fetchClient from './fetch-client';
import store from './store';
import { getAuthToken } from './authentication';

export function getDownloadFolder() {
  const downloadPath = store.get('downloadFolder') as string;

  // Ensure the download folder exists
  if (!existsSync(downloadPath)) {
    fsPromises.mkdir(downloadPath, { recursive: true });
  }

  return downloadPath;
}

export function setDownloadFolder(downloadFolder: string) {
  store.set('downloadFolder', downloadFolder);
}

export function getStoredVersions() {
  return store.get('versions', []);
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

  // add to downloaded file
  const downloads = await getDownloadsJSON()
  downloads.push({assetName: asset_name, downloadedVersion: '0.0', folderHash: current_hash})
  await writeDownloadsJSON(downloads)
  
  store.set('versions', [...getStoredVersions(), newEntry]);
}

export async function openFolder(asset_id: string, semver: string | null) {
  const stored = getStoredVersions().find((v) => v.asset_id === asset_id && v.semver === semver);
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

export async function commitChanges(
  asset_id: string,
  semver: string | null,
  message: string,
  is_major: boolean,
) {
  const folderName = getStoredVersions().find(
    (v) => v.asset_id === asset_id && v.semver === semver,
  )?.folderName;

  console.log('folderName', folderName);

  if (!folderName) {
    console.log('no folder name found for', asset_id, semver);
    return;
  }

  const asset_name = folderName.split("_")[0]

  const sourceFolder = path.join(getDownloadFolder(), folderName);
  const zipFilePath = path.join(app.getPath('temp'), `${asset_id}_${semver}.zip`);
  console.log('sourceFolder is: ', sourceFolder); // debug log
  console.log('zipFilePath is: ', zipFilePath);

  // Zip up asset folder
  await zipFolder(sourceFolder, zipFilePath);
  const fileContents = await fsPromises.readFile(zipFilePath);
  const fileData = new Blob([fileContents], { type: 'application/zip' });

  // Uploading Zip file with multipart/form-data
  const { data, response, error } = await fetchClient.POST('/api/v1/assets/{uuid}/versions', {
    params: { path: { uuid: asset_id } },
    body: {
      file: fileData as unknown as string,
      message: message,
      is_major: is_major,
    },
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    bodySerializer(body) {
      const formData = new FormData();
      formData.append('file', body.file as unknown as Blob, `${asset_id}_${semver}.zip`);
      formData.append('message', body.message);
      formData.append('is_major', (body.is_major ?? false).toString());
      return formData;
    },
  });

  if (error || !response.ok) {
    console.log('error uploading zip file', error, response.status);
    throw new Error(`Failed to upload zip file for asset ${asset_id}`);
  }

  // TODO: make this remove old version entry from store
  // Update local store with the new version
  const newVersion = { asset_id, semver, folderName };
  const versions = getStoredVersions();
  versions.push(newVersion);
  store.set('versions', versions);

  // Clean up the zip file
  await fsPromises.rm(zipFilePath);

  // Update saved hash
  const new_hash = await getFolderHash(sourceFolder)

  const downloads = await getDownloadsJSON()
  const newDownloads = downloads.filter((asset) => asset.assetName !== asset_name) // remove prev entry
  newDownloads.push({assetName: asset_name, downloadedVersion: data.semver!, folderHash: new_hash})
  await writeDownloadsJSON(newDownloads)

  return store.get('versions', []);
}

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
  // remove old copy of folder 
  const folderPath = path.join(getDownloadFolder(), folderName)
  await fsPromises.rm(folderPath, {force: true, recursive : true})
  await extract(zipFilePath, { dir: folderPath });

  console.log('removing zip file...');
  await fsPromises.rm(zipFilePath);

  console.log('marking as done!');
  store.set('versions', [
    ...getStoredVersions(),
    { asset_id, semver, folderName } satisfies DownloadedEntry,
  ]);

  const current_hash = await getFolderHash(folderPath)

  // add to downloads JSON
  const downloads = await getDownloadsJSON()
  const newDownloads = downloads.filter((asset) => asset.assetName !== asset_name) // remove prev entry
  newDownloads.push({assetName: asset_name, downloadedVersion: semver, folderHash: current_hash})
  await writeDownloadsJSON(newDownloads)

  console.log('we made it! check', getDownloadFolder());
}

/**
 * Removes a version from the store and deletes the associated folder
 */
export async function removeVersion({
  asset_id,
  semver,
  assetName
}: {
  asset_id: string;
  semver: string | null;
  assetName: string;
}) {
  const versions = getStoredVersions();

  const stored = versions.find((v) => v.asset_id === asset_id && v.semver === semver);
  if (!stored) return;

  // delete folder
  const folderPath = path.join(getDownloadFolder(), stored.folderName);
  await fsPromises.rm(folderPath, { recursive: true });

  // remove from store
  const newVersions = versions.filter((v) => v.asset_id !== asset_id || v.semver !== semver);

  // remove from downloads JSON
  const downloads = await getDownloadsJSON()
  console.log(`remove ${assetName}`)
  const newDownloads = downloads.filter((asset) => asset.assetName !== assetName)
  await writeDownloadsJSON(newDownloads)
  
  store.set('versions', newVersions);
}
