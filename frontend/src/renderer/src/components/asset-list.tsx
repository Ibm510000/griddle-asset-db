import { useMemo } from 'react';
import { BiPlug } from 'react-icons/bi';

import { useAssetsSearch } from '@renderer/hooks/use-assets-search';
import useDownloads from '@renderer/hooks/use-downloads';
import AssetEntry from './asset-entry';

export default function AssetList() {
  const { assets, error } = useAssetsSearch();

  // inject info about downloaded assets
  const { downloadedVersions } = useDownloads();
  const assetsWithDownloadInfo = useMemo(
    () =>
      assets?.map((asset) => ({
        ...asset,
        isDownloaded: downloadedVersions?.findIndex(({ asset_id }) => asset_id === asset.id) !== -1,
      })),
    [assets, downloadedVersions],
  );

  return (
    <>
      {/* Main body (asset browser) */}
      <div className="absolute inset-0 overflow-y-auto">
        {error && (
          <div className="flex w-full select-none items-center justify-center gap-2 bg-secondary px-4 py-4 font-medium tracking-wide text-secondary-content">
            <BiPlug className="animate-pulse" />
            Can&apos;t connect to Griddle
            {import.meta.env.DEV ? ' – is the backend running?' : '.'}
          </div>
        )}
        {assetsWithDownloadInfo && (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] items-start gap-4 px-6 py-4">
            {assetsWithDownloadInfo.map(({ isDownloaded, ...asset }) => (
              <AssetEntry key={asset.id} asset={asset} isDownloaded={isDownloaded} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
