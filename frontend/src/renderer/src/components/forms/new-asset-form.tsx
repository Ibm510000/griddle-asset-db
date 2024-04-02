import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { useAssetsSearchRefetch } from '@renderer/hooks/use-assets-search';
import fetchClient from '@renderer/lib/fetch-client';
import { encodeThumbnailImage } from '@renderer/lib/image-util';
import useDownloads from '@renderer/hooks/use-downloads';

export interface NewAssetFormData {
  assetName: string;
  keywords: string;
  thumbnailFile: File;
}

export default function NewAssetForm({
  afterSubmit,
}: {
  afterSubmit?: SubmitHandler<NewAssetFormData>;
}) {
  const refetchSearch = useAssetsSearchRefetch();
  const { register, control, handleSubmit } = useForm<NewAssetFormData>({
    defaultValues: { assetName: '', keywords: '', thumbnailFile: undefined },
  });

  const { mutate: mutateDownloads } = useDownloads();

  const submitHandler = async (data: NewAssetFormData) => {
    let image_uri;
    try {
      image_uri = await encodeThumbnailImage(await data.thumbnailFile!.arrayBuffer());
    } catch (err) {
      // TODO: toast
      console.error('Error encoding thumbnail image:', err);
      return;
    }

    // Calling fetchClient.POST()
    const {
      data: resData,
      response,
      error,
    } = await fetchClient.POST('/api/v1/assets/', {
      body: {
        asset_name: data.assetName,
        keywords: data.keywords,
        image_uri,
      },
    });

    if (error) throw error;
    if (!response.status.toString().startsWith('2'))
      throw new Error(`Non-OK response with code ${response.status}: ${response.statusText}`);

    // Create initial version for the asset
    await window.api.ipc('assets:create-initial-version', {
      asset_id: resData.id,
      asset_name: data.assetName,
    });

    mutateDownloads();
    refetchSearch();

    // Combine assetFiles from state with form data
    if (afterSubmit) afterSubmit(data); // Call the onSubmit function provided by props
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <div className="mt-4">
        <label htmlFor="assetName" className="block text-sm font-medium text-gray-700">
          Asset Name
        </label>
        <input
          type="text"
          id="assetName"
          className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Enter asset name"
          {...register('assetName', { required: true })}
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
          placeholder="Enter keywords"
          {...register('keywords', { required: true })}
        />
      </div>

      {/* Thumbnail upload controller */}
      <Controller
        control={control}
        name="thumbnailFile"
        rules={{ required: true }}
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
            <label htmlFor="thumbnailUpload" className="block text-sm font-medium text-gray-700">
              Upload Thumbnail
            </label>
            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M27 4v16h16M27 4l17 17M43 21H5M13 12h22v9l5 4V8l-5 4z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
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
                      onClick={() => onChange(undefined)}
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
        <button type="submit" className="btn btn-primary">
          Create
        </button>
      </div>
    </form>
  );
}
