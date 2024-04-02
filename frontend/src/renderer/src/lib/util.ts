import { Version } from '@renderer/types';
import fetchClient from './fetch-client';

/**
 * Creates initial version if asset has none, otherwise downloads latest version
 */
export async function syncAsset({ uuid, asset_name }: { uuid: string; asset_name: string }) {
  let latestVersion: Version | undefined;
  {
    const {
      data: versions,
      response,
      error,
    } = await fetchClient.GET(`/api/v1/assets/{uuid}/versions`, {
      params: { path: { uuid } },
    });

    if (response.status !== 200 || error) {
      console.error('Failed to fetch metadata for asset', uuid);
      return;
    }

    latestVersion = versions.at(0);
  }

  if (latestVersion === undefined) {
    // logic for if there is no initial version
    await window.api.ipc('assets:create-initial-version', { asset_id: uuid, asset_name });
  } else {
    // fetch latest version otherwise
    await window.api.ipc('assets:download-version', {
      asset_id: uuid,
      semver: latestVersion.semver,
    });
  }
}
