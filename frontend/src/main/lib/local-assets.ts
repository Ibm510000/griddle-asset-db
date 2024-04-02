import Store from 'electron-store';
import { existsSync } from 'node:fs';
import { createWriteStream } from 'fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import extract from 'extract-zip';

import { app } from 'electron';
import fetchClient from './fetch-client';
import { DownloadedEntry } from '../../types/ipc';
import archiver from 'archiver';

const assetsStore = new Store<{ versions: DownloadedEntry[]; downloadFolder: string }>({
  defaults: { versions: [], downloadFolder: path.join(app.getPath('documents'), 'Griddle') },
});

export function getDownloadFolder() {
  const downloadPath = assetsStore.get('downloadFolder') as string;

  // Ensure the download folder exists
  if (!existsSync(downloadPath)) {
    fsPromises.mkdir(downloadPath, { recursive: true });
  }

  return downloadPath;
}

export function setDownloadFolder(downloadFolder: string) {
  assetsStore.set('downloadFolder', downloadFolder);
}

export function getStoredVersions() {
  return assetsStore.get('versions', []);
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
  assetsStore.set('versions', [...getStoredVersions(), newEntry]);
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

  const sourceFolder = path.join(getDownloadFolder(), folderName);
  const zipFilePath = path.join(app.getPath('temp'), `${asset_id}_${semver}.zip`);
  console.log('sourceFolder is: ', sourceFolder); // debug log
  console.log('zipFilePath is: ', zipFilePath);

  // Zip up asset folder
  await zipFolder(sourceFolder, zipFilePath);
  const fileContents = await fsPromises.readFile(zipFilePath);
  const fileData = new Blob([fileContents], { type: 'application/zip' });

  // Uploading Zip file with multipart/form-data
  const { response, error } = await fetchClient.POST('/api/v1/assets/{uuid}/versions', {
    params: { path: { uuid: asset_id } },
    body: {
      file: fileData as unknown as string,
      message: message,
      is_major: is_major,
    },
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

  // Update local store with the new version
  const newVersion = { asset_id, semver, folderName };
  const versions = getStoredVersions();
  versions.push(newVersion);
  assetsStore.set('versions', versions);

  // Clean up the zip file
  await fsPromises.rm(zipFilePath);

  return assetsStore.get('versions', []);
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
  await extract(zipFilePath, { dir: path.join(getDownloadFolder(), folderName) });

  console.log('removing zip file...');
  await fsPromises.rm(zipFilePath);

  console.log('marking as done!');
  assetsStore.set('versions', [
    ...getStoredVersions(),
    { asset_id, semver, folderName } satisfies DownloadedEntry,
  ]);

  console.log('we made it! check', getDownloadFolder());
}

/**
 * Removes a version from the store and deletes the associated folder
 */
export async function removeVersion({
  asset_id,
  semver,
}: {
  asset_id: string;
  semver: string | null;
}) {
  const versions = getStoredVersions();

  const stored = versions.find((v) => v.asset_id === asset_id && v.semver === semver);
  if (!stored) return;

  // delete folder
  const folderPath = path.join(getDownloadFolder(), stored.folderName);
  await fsPromises.rm(folderPath, { recursive: true });

  // remove from store
  const newVersions = versions.filter((v) => v.asset_id !== asset_id || v.semver !== semver);
  assetsStore.set('versions', newVersions);
}
