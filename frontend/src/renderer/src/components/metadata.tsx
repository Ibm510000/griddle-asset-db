import { Asset } from '../types';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { CiEdit } from 'react-icons/ci';
import fetchClient from '@renderer/lib/fetch-client';
import { Controller, useForm } from 'react-hook-form';
import { encodeThumbnailImage } from '@renderer/lib/image-util';

interface Props {
  asset: Asset | null;
}

interface UpdateMetadataData {
  thumbnailFile: File | undefined;
}

function Metadata({ asset }: Props): JSX.Element {
  const [editMode, setEditMode] = useState(false);
  const [editedAsset, setEditedAsset] = useState<Asset | null>(null);

  const { control, handleSubmit } = useForm<UpdateMetadataData>({
    defaultValues: { thumbnailFile: undefined},
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

  if (!asset) {
    return (
      <div>
        <div className="text-lg">Metadata</div>
        <div>Please select an asset</div>
      </div>
    );
  }

  // If an asset is selected, render its information
  return (
    <div>
      <div className="flex">
        <div className="text-lg">Metadata</div>
        {!editMode && (
          <button onClick={handleEditClick}>
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
        <button
          type="submit"
          className="rounded border border-gray-400 bg-white px-4 py-2 font-bold text-black hover:bg-gray-300"
        >
          Save
        </button>
      </div>
          </form>
        </>
      ) : (
        <>
          <div className="block text-sm font-medium text-gray-700"> Asset Name: {asset.asset_name}</div>
          <div className="block text-sm font-medium text-gray-700">Keywords: {asset.keywords}</div>
          <div className="block text-sm font-medium text-gray-700">Author: {asset.author_pennkey}</div>
          {asset.image_uri && <img src={asset.image_uri} alt={asset.asset_name} className="mb-2 aspect-square w-full rounded-lg bg-base-300"/>}
          {/* Update Asset Button */}
        <Link className="btn btn-outline" to={`/update-asset?assetId=${asset.id}`}>
          + Update Asset
        </Link>
        </>
      )}
        
    </div>
  );
}

export default Metadata;
