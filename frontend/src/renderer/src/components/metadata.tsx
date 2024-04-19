import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CiEdit } from 'react-icons/ci';
import { MdFolderOpen, MdSync, MdSyncDisabled } from 'react-icons/md';
import { Link } from 'react-router-dom';
import VersionSelector from './version-selector';

import { useSelectedAsset } from '@renderer/hooks/use-asset-select';
import useDownloads from '@renderer/hooks/use-downloads';
import fetchClient from '@renderer/lib/fetch-client';
import { encodeThumbnailImage } from '@renderer/lib/image-util';
import { Asset } from '@renderer/types';
import { useAssetsSearchRefetch } from '@renderer/hooks/use-assets-search';

const thomasImage =
  'data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAgICAgJCAkKCgkNDgwODRMREBARExwUFhQWFBwrGx8bGx8bKyYuJSMlLiZENS8vNUROQj5CTl9VVV93cXecnNEBCAgICAkICQoKCQ0ODA4NExEQEBETHBQWFBYUHCsbHxsbHxsrJi4lIyUuJkQ1Ly81RE5CPkJOX1VVX3dxd5yc0f/CABEIAEAAQAMBIgACEQEDEQH/xAAzAAACAgMBAQAAAAAAAAAAAAAFBgMHAAIEAQgBAQEBAQEBAAAAAAAAAAAAAAQCAwAFBv/aAAwDAQACEAMQAAAA79vZPovDxeK0SVLOzIwgrPo7EGxWgHy7ydS5VV4VkR3NEXJYr4LRV2vUCxKokE5kA5IZlqJOAGYb37jBjtjhuAgkRJWNOlzqyO9UF3W0i3kd/8QALRAAAgEEAQIGAQIHAAAAAAAAAQIDAAQFERIhMQYTIjJBUXEUYQcQFTNSgpH/2gAIAQEAAT8AArVIm6zviezwz+QImmuSobj2Vd/Zo+OM40vLnCF/wEdYrxylxNHDeQopYhQ60nGRA69VPY1xoClFZfJJicbNeFOTDSov27dBUjXN/dSSuzSSyOWZj8k1HgmKcnk0aeB4ZiOxU9DXgPIXVzNd28rMyJGrAk0VoLSivF9t5/hu9IXbRcJR/q1Wz/ooYmCIWZQx3snr+Knu5Fto5RGmm+91+livcZessamZEMgYb36evY1/DhHN3k5APQIY13RFBaC1lbd7jD5KFF5NJayKo+yRUotEjjTiGYAAD8UtzaPavEqB2HZdGsQ9lMkiIApKMhH5FeD7FrOLIKigW5aMRtrqxUaJorWameO3g4MRuXr/AM3WHmeSOUtIX0RrZ3qpJJv6peMZGKqPSAx9GtV4jxrC8EyllWdQ4ZfhgPUKghjZiiwyLIR7/MfVYOzMV1EHLMS42zdzTH4B0KS5R5nh5tzU+0xkaHb3Hv2o579cQzNGioS2idKv5JrF5OIiKOJRuZtmQPv2ntxq4dEv5dMFZogT10SfsfvU+blyMEtsVCmNiVIGwwU63+1RTZVLgKFBXferRpIp0Lt12DUeUma5aG6R44ydCRdAdOvX81ZPJHdp590BHIwLEnso31B30q6waMLlrXhHEYiIGbcrlz6jz+h8ChaPDIzRXNpbweYP7pdiARrq5C9Pmrl8fawsrZITOSEZopBIencqvEAg/bGsdlXu74xKvlxFCVUsznYAGuTUXkjYEdvmlnJbke1Z3LNfXzNE7CJFCLokb49d1a+IZlQJcL5gGtOPf0+996yOemN0zJGebOnrLKInQDWvQazeau76UxMyrGje1DtSV+QaJJ7moJ5LeZJozp0OxS+J4Wj1JasH+eJBFZHOzXcXkxp5Ufz12zfz/8QAIBEAAgICAgIDAAAAAAAAAAAAAQIAEQMSITEiYTJBcv/aAAgBAgEBPwDaZ85Qar8oufMpFm4uQMLELTMLa/UP6ERqUQnyHEyrttOyOJmfVgAG4o8Dv1AxGMNZ56u7m7FgSxmyj7uByJ//xAAkEQABAgUCBwAAAAAAAAAAAAABABECAwQSISIxEBMyQUJhgf/aAAgBAwEBPwBlT095eLZRU0sjpZRy7IiFYqYafqZTpR5hQGk5UqK0w+14qVLuBcjuMnZEambY5QAAwE+OH//Z';

export default function Metadata() {
  const { asset, versions, latestVersion } = useSelectedAsset();
  const { downloadedVersions, downloads, syncAsset, unsyncAsset, isValidating } = useDownloads();
  const refetchSearch = useAssetsSearchRefetch()

  // versions for showing asset versions
  const allVersions = versions ? versions.map((v) => v.semver) : [];
  const latest = latestVersion !== undefined? latestVersion : '0.0'
  const [selectedVersion, setSelectedVersion] = useState(latest); // default to most recent version

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
    var downloaded_version = latest
    if (downloads) {
      var found_v = downloads.find((a) => asset?.asset_name === a.assetName)?.downloadedVersion
      downloaded_version = found_v ? found_v : latest
    }
    setSelectedVersion(downloaded_version) // binds selectedVersion to the version that is currently synced
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

    refetchSearch()
  };

  const onSelectVersionClick = async (item) => {
    if (!asset) return;

    setSelectedVersion(item)
    syncAsset({ uuid: asset.id, selectedVersion: item });
  }

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
        <div>
          {asset.image_uri && (
            <img
              src={asset.image_uri}
              alt={asset.asset_name}
              className="mt-2 aspect-square w-full rounded-lg bg-base-300"
            />
          )}
          <div className="mt-4 text-2xl font-bold leading-tight tracking-tight text-base-content">
            {asset.asset_name}
          </div>
          {/* Keyword list */}
          <div className="mt-2 font-medium text-base-content">
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
          <div className="mt-6">
            {/* Sync button */}
            {!isDownloaded && (
              <button
                className="btn btn-outline btn-primary flex w-full flex-row items-center gap-2"
                disabled={isValidating}
                onClick={() => {
                  syncAsset({ uuid: asset.id, selectedVersion: null });
                }}
              >
                <MdSync />
                Sync
              </button>
            )}
            {/* Update Asset Button */}
            {isDownloaded && (
              <>          
                <VersionSelector selectedVersion={selectedVersion} setSelectedVersion={onSelectVersionClick} allVersions={allVersions}/>
                <button
                  className="btn btn-ghost btn-sm flex w-full flex-row flex-nowrap items-center justify-start gap-2 text-sm font-normal"
                  onClick={onOpenFolderClick}
                >
                  <MdFolderOpen />
                  Open
                </button>
                <Link
                  className="btn btn-outline btn-primary mt-2 w-full justify-start"
                  to={{ pathname: `/update-asset`, search: `?id=${asset.id}` }}
                >
                  Commit Changes
                </Link>
                <button
                  className="btn btn-ghost btn-sm mt-2 flex w-full flex-row flex-nowrap items-center justify-start gap-2 text-sm font-normal"
                  disabled={isValidating}
                  onClick={() => unsyncAsset({ uuid: asset.id, assetName: asset.asset_name })}
                >
                  <MdSyncDisabled className="h-5 w-5" />
                  Unsync
                </button>
              </>
            )}
          </div>
          <h3 className="divider mt-12 text-base-content/50">Contributors</h3>
          {/* Original author */}
          <div className="flex flex-row items-center gap-x-4">
            <div className="avatar">
              <img
                // TODO: Replace this with a real image
                src={thomasImage}
                className="w-8 rounded-full"
              />
            </div>
            <div>
              <div className="text-xs opacity-60">Original Author</div>
              <div className="font-semibold text-base-content">{asset.author_pennkey}</div>
            </div>
          </div>
          {/* Last 3 versions */}
          <ul className="mt-8">
            {versions?.map(({ date, message, semver, author_pennkey }) => (
              <li className="chat chat-start space-y-0.5" key={`${asset.id}_${semver}`}>
                <div className="avatar chat-image">
                  <div className="w-10 rounded-full">
                    <img src={thomasImage} />
                  </div>
                </div>
                <div className="chat-header text-xs tracking-wide text-base-content/40">
                  <span className="text-base-content/70">{author_pennkey}</span> on{' '}
                  <time className="text-base-content/70">
                    {new Date(date).toLocaleDateString()}
                  </time>
                </div>
                <div className="chat-bubble- chat-bubble">
                  <span className="badge -ml-1 mr-1 font-mono">{semver}</span> {message}
                </div>
                <hr />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
