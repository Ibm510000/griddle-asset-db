import { useAssetSelectStore } from '@renderer/hooks/use-asset-select';
import { Asset, Version } from '@renderer/types';
import { MdCheckCircle, MdDownload, MdDownloading } from 'react-icons/md';

import useDownloads from '@renderer/hooks/use-downloads';
import { useState } from 'react';
import funnygif from '../assets/funny.gif';
import fetchClient from '@renderer/lib/fetch-client';

export default function AssetEntry({
  asset: { asset_name, author_pennkey, id, image_uri },
  isDownloaded,
}: {
  asset: Asset;
  isDownloaded: boolean;
}) {
  const { selectedId, setSelected } = useAssetSelectStore();
  const isSelected = selectedId === id;

  const { mutate: mutateDownloads } = useDownloads();

  const [isDownloading, setDownloading] = useState(false);

  const onDownloadClick = async () => {
    setDownloading(true);
    let latestVersion: Version | undefined;
    {
      const {
        data: versions,
        response,
        error,
      } = await fetchClient.GET(`/api/v1/assets/{uuid}/versions`, {
        params: { path: { uuid: id } },
      });

      if (response.status !== 200 || error) {
        console.error('Failed to fetch metadata for asset', id);
        setDownloading(false);
        return;
      }

      latestVersion = versions.at(0);
    }

    if (latestVersion === undefined) {
      // logic for if there is no initial version
      await window.api.ipc('assets:create-initial-version', { asset_id: id, asset_name });
    } else {
      // fetch latest version otherwise
      await window.api.ipc('assets:download-version', {
        asset_id: id,
        semver: latestVersion.semver,
      });
    }

    setDownloading(false);
    await mutateDownloads();
  };

  return (
    <li className="h-full w-full">
      <button
        type="button"
        onClick={(evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          setSelected(id);
        }}
        className={`group inline-flex h-full w-full flex-col rounded-2xl bg-base-100 p-3 text-left shadow transition-shadow focus-visible:outline-none ${isSelected ? 'ring-2 ring-primary/60 focus-visible:outline-none focus-visible:ring-4' : 'ring-primary/40 focus-visible:ring-4'}`}
      >
        <div
          style={{ backgroundImage: `url(${image_uri || funnygif})` }}
          className="relative mb-2 aspect-square w-full rounded-lg bg-base-300 bg-contain bg-center bg-no-repeat"
        >
          <button
            onClick={onDownloadClick}
            className={`absolute left-2 top-2 rounded-full bg-base-100 p-1 text-xl text-base-content drop-shadow transition-opacity ${isDownloaded ? '' : 'opacity-0 group-hover:opacity-100'}`}
            disabled={isDownloaded || isDownloading}
          >
            {!isDownloaded && !isDownloading && <MdDownload />}
            {!isDownloaded && isDownloading && <MdDownloading />}
            {isDownloaded && <MdCheckCircle />}
          </button>
        </div>
        <div className="px-1">
          {asset_name} -- {author_pennkey}
        </div>
      </button>
    </li>
  );
}
