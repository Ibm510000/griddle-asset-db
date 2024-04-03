import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CiEdit } from 'react-icons/ci';
import { MdFolderOpen, MdSync, MdSyncDisabled } from 'react-icons/md';
import { Link } from 'react-router-dom';

import { useSelectedAsset } from '@renderer/hooks/use-asset-select';
import useDownloads from '@renderer/hooks/use-downloads';
import fetchClient from '@renderer/lib/fetch-client';
import { encodeThumbnailImage } from '@renderer/lib/image-util';
import { Asset } from '@renderer/types';
import { syncAsset } from '@renderer/lib/util';

export default function Metadata() {
  const { asset, versions } = useSelectedAsset();
  const { downloadedVersions, mutate } = useDownloads();

  // versions also available here for showing asset versions!

  const isDownloaded = useMemo(() => {
    return downloadedVersions?.findIndex(({ asset_id }) => asset_id === asset?.id) !== -1;
  }, [downloadedVersions, asset]);

  interface UpdateMetadataData {
    thumbnailFile: File | undefined;
  }

  const [editMode, setEditMode] = useState(false);
  const [editedAsset, setEditedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    if (!asset) setEditMode(false);
  }, [asset, setEditMode]);

  const { control, handleSubmit } = useForm<UpdateMetadataData>({
    defaultValues: { thumbnailFile: undefined },
  });

  const handleEditClick = () => {
    if (!asset) return;
    setEditMode(true);
    setEditedAsset({ ...asset }); // Copy the original asset to the edited asset
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Asset) => {
    if (!editedAsset) return;
    setEditedAsset({ ...editedAsset, [field]: e.target.value });
  };

  const handleSaveClick = async (data: UpdateMetadataData) => {
    if (!editedAsset) return;
    if (!asset) return;

    // Encode the thumbnail image if it's present
    let image_uri;
    if (data.thumbnailFile !== undefined) {
      try {
        image_uri = await encodeThumbnailImage(await data.thumbnailFile!.arrayBuffer());
      } catch (err) {
        // TODO: toast
        console.error('Error encoding thumbnail image:', err);
        return;
      }
    } else {
      image_uri = editedAsset.image_uri;
    }

    const { response, error } = await fetchClient.PUT(`/api/v1/assets/{uuid}`, {
      body: {
        asset_name: editedAsset.asset_name,
        keywords: editedAsset.keywords,
        image_uri,
      },
      params: {
        path: {
          uuid: editedAsset.id,
        },
      },
    });

    if (error) throw error;
    if (!response.status.toString().startsWith('2'))
      throw new Error(`Non-OK response with code ${response.status}: ${response.statusText}`);

    setEditMode(false);
    asset.asset_name = editedAsset.asset_name;
    asset.keywords = editedAsset.keywords;
    asset.image_uri = image_uri;

    data.thumbnailFile = undefined;
  };

  const onUnsyncClick = async () => {
    console.log('unsyncing asset', asset);
    if (!asset) {
      console.log('asset not found');
      return;
    }

    const downloaded = downloadedVersions?.find(({ asset_id }) => asset_id === asset.id);
    if (!downloaded) {
      console.log('asset not downloaded');
      return;
    }

    await window.api.ipc('assets:remove-version', {
      asset_id: asset.id,
      semver: downloaded.semver, // TODO: make this more robust
    });

    await mutate();
  };

  const onOpenFolderClick = async () => {
    if (!asset) return;

    const downloaded = downloadedVersions?.find(({ asset_id }) => asset_id === asset.id);
    if (!downloaded) return;

    await window.api.ipc('assets:open-folder', {
      asset_id: asset.id,
      semver: downloaded.semver,
    });
  };

  if (!asset) {
    return (
      <div className="flex h-full flex-col px-6 py-4">
        <div className="text-lg">Metadata</div>
        <div className="text-base-content/50">Select an asset</div>
      </div>
    );
  }

  // If an asset is selected, render its information
  return (
    <div className="flex h-full flex-col px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="text-base-content/50">Metadata</div>
        {!editMode && (
          <button onClick={handleEditClick} className="btn btn-ghost btn-sm">
            <CiEdit className="h-4 w-4" />
          </button>
        )}
      </div>

      {editMode ? (
        <>
          <form onSubmit={handleSubmit(handleSaveClick)}>
            <div className="mt-4">
              <label htmlFor="asset_name" className="block text-sm font-medium text-gray-700">
                Asset Name
              </label>
              <input
                type="text"
                id="asset_name"
                className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={editedAsset?.asset_name}
                onChange={(e) => handleInputChange(e, 'asset_name')}
                required
              />
            </div>
            <div className="mt-4">
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                Keywords
              </label>
              <input
                type="text"
                id="keywords"
                className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={editedAsset?.keywords}
                onChange={(e) => handleInputChange(e, 'keywords')}
                required
              />
            </div>

            <Controller
              control={control}
              name="thumbnailFile"
              render={({ field: { value, onChange, ref } }) => (
                <div
                  className="mt-4"
                  onDrop={(event) => {
                    event.preventDefault();
                    const droppedFile = event.dataTransfer.files[0];
                    onChange(droppedFile);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                >
                  <label
                    htmlFor="thumbnailUpload"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Upload Thumbnail
                  </label>
                  <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
                    <div className="space-y-1 text-center">
                      <div className="text-sm text-gray-600">
                        <label
                          htmlFor="thumbnail-upload"
                          className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                        >
                          <span>Upload Thumbnail</span>
                          <input
                            id="thumbnail-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            ref={ref}
                            onChange={(event) => {
                              onChange(event.target.files?.[0]);
                            }}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">Image file</p>
                      {value && (
                        <div>
                          <p className="text-xs text-gray-500">{value.name}</p>
                          <button
                            type="button"
                            onClick={() => onChange(null)}
                            className="text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            />
            <div className="mt-4">
              <button type="submit" className="btn btn-outline">
                Save
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <div className="flex flex-col space-y-4">
            <div className="mt-2 text-2xl font-bold leading-tight tracking-tight text-base-content">
              {asset.asset_name}
            </div>
            <div className="font-medium text-base-content">
              <div className="flex flex-row flex-wrap gap-1">
                {asset.keywords?.split(',').map((keyword) => (
                  <span
                    key={keyword}
                    className="my-auto rounded bg-primary/90 px-2 py-1 text-xs text-primary-content/100"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col font-medium text-base-content/90">
              Author:
              <div className="font-bold text-base-content">{asset.author_pennkey}</div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              <div className="flex flex-col">
                {' '}
                Versions:
                {versions?.map((version) => (
                  <div key={version.asset_id} className="flex flex-row">
                    <div className="text-base-content">{version.semver}:</div>
                    <div className="mt-auto pl-2 text-base-content/50">
                      {version.date.split('T')[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {!isDownloaded && (
              <button
                className="btn btn-outline btn-primary mt-2 flex flex-row items-center gap-2"
                onClick={async () => {
                  await syncAsset({ asset_name: asset.asset_name, uuid: asset.id });
                  await mutate();
                }}
              >
                <MdSync />
                Sync
              </button>
            )}
            {/* Update Asset Button */}
            {isDownloaded && (
              <>
                <button
                  className="btn btn-ghost btn-sm mt-6 flex flex-row flex-nowrap items-center gap-2 text-sm"
                  onClick={onOpenFolderClick}
                >
                  <MdFolderOpen />
                  Open
                </button>
                <Link
                  className="btn btn-outline btn-primary mt-2"
                  to={{ pathname: `/update-asset`, search: `?id=${asset.id}` }}
                >
                  Commit Changes
                </Link>
                <button
                  className="btn btn-ghost btn-sm mt-2 flex flex-row flex-nowrap items-center gap-2 text-sm"
                  onClick={onUnsyncClick}
                >
                  <MdSyncDisabled className="h-5 w-5" />
                  Unsync
                </button>
              </>
            )}
          </div>
          {asset.image_uri && (
            <img
              src={asset.image_uri}
              alt={asset.asset_name}
              className="mt-auto aspect-square w-full rounded-lg bg-base-300"
            />
          )}
        </>
      )}
    </div>
  );
}
