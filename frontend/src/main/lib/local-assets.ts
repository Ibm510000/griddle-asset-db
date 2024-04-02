import Store from 'electron-store';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import extract from 'extract-zip';

import { app } from 'electron';
import fetchClient from './fetch-client';
import { DownloadedEntry } from '../../types/ipc';

const assetsStore = new Store<{ versions: DownloadedEntry[]; downloadFolder: string }>({
  defaults: { versions: [], downloadFolder: path.join(app.getPath('documents'), 'Griddle') },
});

export function getDownloadFolder() {
  const downloadPath = assetsStore.get('downloadFolder') as string;

  // Ensure the download folder exists
  if (!existsSync(downloadPath)) {
    fs.mkdir(downloadPath, { recursive: true });
  }

  return downloadPath;
}

export function setDownloadFolder(downloadFolder: string) {
  assetsStore.set('downloadFolder', downloadFolder);
}

export function getStoredVersions() {
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
  fs.writeFile(zipFilePath, fileBuffer);

  console.log('unzipping!');
  // previously had semver in here but probably not necessary
  // const folderName = `${asset_name}_${semver}_${asset_id.substring(0, 8)}/`;
  const folderName = `${asset_name}_${asset_id.substring(0, 8)}/`;
  await extract(zipFilePath, { dir: path.join(getDownloadFolder(), folderName) });

  console.log('removing zip file...');
  await fs.rm(zipFilePath);

  console.log('marking as done!');
  assetsStore.set('versions', [
    ...getStoredVersions(),
    { asset_id, semver, folderName } satisfies DownloadedEntry,
  ]);

  console.log('we made it! check', getDownloadFolder());
}
