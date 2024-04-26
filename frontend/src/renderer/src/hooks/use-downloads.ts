import { useCallback } from 'react';
import useSWR from 'swr';

import fetchClient from '@renderer/lib/fetch-client';
import { Version } from '@renderer/types';

const fetcher = () => {
  return window.api.ipc('assets:list-downloaded', null).then((response) => response.versions);
};

export default function useDownloads() {
  const {
    data: downloadedVersions,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR('ipc:assets:list-downloaded', fetcher);

  /**
   * Download an asset by UUID with the specified version, or latest if not provided
   */
  function syncAsset({
    uuid,
    asset_name,
    semver,
  }: {
    uuid: string;
    asset_name: string;
    semver?: string;
  }) {
    return mutate(async () => {
      // fetch latest version to download
      let latestVersion: Version;
      {
        const { data, response, error } = await fetchClient.GET(`/api/v1/assets/{uuid}`, {
          params: { path: { uuid } },
        });

        if (response.status !== 200 || error) {
          console.error('Failed to fetch metadata for asset', uuid);
          return;
        }

        latestVersion = data.versions.at(0)!;
      }

      if (latestVersion === undefined) {
        // if there is no initial version, create empty folder
        await window.api.ipc('assets:create-initial-version', { asset_id: uuid, asset_name });
      } else {
        // fetch latest version otherwise
        await window.api.ipc('assets:download-version', {
          asset_id: uuid,
          semver: semver || latestVersion.semver,
        });
      }

      return fetcher();
    });
  }

  function unsyncAsset({ uuid, assetName }: { uuid: string; assetName: string }) {
    return mutate(async () => {
      console.log('unsyncing asset', uuid);

      const downloaded = downloadedVersions?.find(({ asset_id }) => asset_id === uuid);
      if (!downloaded) {
        console.log('asset not downloaded');
        return;
      }

      // TODO: make sure we don't remove uncommitted changes
      await window.api.ipc('assets:remove-download', {
        asset_id: uuid,
        assetName: assetName,
      });

      return fetcher();
    });
  }

  const commitChanges = useCallback(
    async (opts: {
      asset_id: string;
      semver: string | null;
      message: string;
      is_major: boolean;
    }) => {
      return mutate(async () => {
        await window.api.ipc('assets:commit-changes', opts);
        return fetcher();
      });
    },
    [mutate],
  );

  const openFolder = useCallback(async ({ asset_id }: { asset_id: string }) => {
    await window.api.ipc('assets:open-folder', { asset_id });
  }, []);

  return {
    downloadedVersions,
    error,
    isLoading,
    isValidating,
    syncAsset,
    unsyncAsset,
    commitChanges,
    openFolder,
    mutate,
  };
}
