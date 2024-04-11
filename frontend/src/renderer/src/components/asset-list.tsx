import { useMemo } from 'react';

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
      {!!error && <p>Couldn&apos;t load assets!</p>}
      {!!assetsWithDownloadInfo && (
        <div className="absolute inset-0 overflow-y-auto">
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] items-start gap-4 px-6 py-4">
            {assetsWithDownloadInfo.map(({ isDownloaded, ...asset }) => (
              <AssetEntry key={asset.id} asset={asset} isDownloaded={isDownloaded} />
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
