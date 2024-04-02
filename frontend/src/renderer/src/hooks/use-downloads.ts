import { useCallback } from 'react';
import useSWR from 'swr';

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

  const downloadAsset = useCallback(
    async ({ asset_id }: { asset_id: string }) => {
      return mutate(async () => {
        await window.api.ipc('assets:download-asset', { asset_id });
        return fetcher();
      });
    },
    [mutate],
  );

  const commitChanges = useCallback(
    async ({ asset_id }: { asset_id: string }) => {
      return mutate(async () => {
        await window.api.ipc('assets:commit-changes', { asset_id });
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
    downloadAsset,
    commitChanges,
    openFolder,
    mutate,
  };
}
