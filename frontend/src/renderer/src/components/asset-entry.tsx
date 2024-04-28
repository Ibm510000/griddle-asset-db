import { useState } from 'react';
import { MdCheckCircle, MdDownload, MdDownloading, MdLogin } from 'react-icons/md';

import { useAssetSelectStore } from '@renderer/hooks/use-asset-select';
import useAuth from '@renderer/hooks/use-auth';
import useDownloads from '@renderer/hooks/use-downloads';
import { Asset } from '@renderer/types';

import funnygif from '../assets/funny.gif';
import { useNavigate } from 'react-router-dom';

export default function AssetEntry({
  asset: { asset_name, author_pennkey, id, image_uri },
  isDownloaded,
}: {
  asset: Asset;
  isDownloaded: boolean;
}) {
  const { loggedIn } = useAuth();
  const navigate = useNavigate();

  const { selectedId, setSelected } = useAssetSelectStore();
  const isSelected = selectedId === id;

  const { mutate: mutateDownloads, syncAsset } = useDownloads();

  const [isDownloading, setDownloading] = useState(false);

  const onDownloadClick = async () => {
    if (!loggedIn) {
      navigate('/user-login');
      return;
    }

    setDownloading(true);
    await syncAsset({ uuid: id, asset_name });
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
          setSelected(id, null);
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
            {isDownloaded ? (
              <MdCheckCircle />
            ) : (
              <>
                {!loggedIn ? (
                  <MdLogin />
                ) : (
                  <>
                    {!isDownloading && <MdDownload />}
                    {isDownloading && <MdDownloading />}
                  </>
                )}
              </>
            )}
          </button>
        </div>
        <div className="px-1">
          {asset_name}
          <div className="text-xs text-base-content/50">{author_pennkey}</div>
        </div>
      </button>
    </li>
  );
}
