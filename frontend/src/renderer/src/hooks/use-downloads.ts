import { useCallback } from 'react';
import useSWR from 'swr';

import fetchClient from '@renderer/lib/fetch-client';
import { Version } from '@renderer/types';

const fetcher = () => {
  return window.api.ipc('assets:list-downloaded', null).then((response) => response.versions);
};

const fetcher2 = () => {
  return window.api.ipc('assets:downloaded-json', null).then((response) => response.downloads);
};

export default function useDownloads() {
  const {
    data: downloadedVersions,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR('ipc:assets:list-downloaded', fetcher);

  const {
    data: downloads,
  } = useSWR('ipc:assets:downloaded-json', fetcher2)

  function syncAsset({ uuid, selectedVersion }: { uuid: string, selectedVersion: string | null}) {
    return mutate(async () => {
      let asset_name: string;
      let latestVersion: Version | undefined;
      {
        const { data, response, error } = await fetchClient.GET(`/api/v1/assets/{uuid}`, {
          params: { path: { uuid } },
        });

        if (response.status !== 200 || error) {
          console.error('Failed to fetch metadata for asset', uuid);
          return;
        }

        latestVersion = data.versions.at(0);
        asset_name = data.asset.asset_name;
      }

      if (latestVersion === undefined) {
        // logic for if there is no initial version
        await window.api.ipc('assets:create-initial-version', { asset_id: uuid, asset_name });
      } else {
        // fetch latest version otherwise
        await window.api.ipc('assets:download-version', {
          asset_id: uuid,
          semver: selectedVersion || latestVersion.semver,
        });
      }

      return fetcher();
    });
  }

  function unsyncAsset({ uuid, assetName }: { uuid: string, assetName: string}) {
    return mutate(async () => {
      console.log('unsyncing asset', uuid);

      const downloaded = downloadedVersions?.find(({ asset_id }) => asset_id === uuid);
      if (!downloaded) {
        console.log('asset not downloaded');
        return;
      }

      await window.api.ipc('assets:remove-version', {
        asset_id: uuid,
        semver: downloaded.semver, // TODO: make this more robust
        assetName: assetName,
      });

      return fetcher();
    });
  }

  function ifFilesChanged(assetName: string, asset_id: string)  {
    return window.api.ipc('assets:files-changed', {assetName, asset_id}).then((response) => response.ifChanged);
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

  const openFolder = useCallback(
    async ({ asset_id, semver }: { asset_id: string; semver: string }) => {
      await window.api.ipc('assets:open-folder', { asset_id, semver });
    },
    [],
  );

  return {
    downloadedVersions,
    error,
    isLoading,
    isValidating,
    downloads,
    syncAsset,
    unsyncAsset,
    commitChanges,
    ifFilesChanged,
    openFolder,
    mutate,
  };
}
