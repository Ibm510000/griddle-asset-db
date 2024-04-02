import { SubmitHandler, useForm } from 'react-hook-form';

import { useAssetsSearchRefetch } from '@renderer/hooks/use-assets-search';

export interface UpdateAssetFormData {
  message: string; // commit message
  is_major: boolean; // major vs minor version
}

interface UpdateAssetFormProps {
  uuid: string; // asset uuid
  afterSubmit?: SubmitHandler<UpdateAssetFormData>;
}

// POST to /api/v1/assets/{uuid}/versions - Upload new version for a given asset
export default function UpdateAssetForm({ uuid, afterSubmit }: UpdateAssetFormProps) {
  const refetchSearch = useAssetsSearchRefetch();
  const { register, handleSubmit } = useForm<UpdateAssetFormData>({
    defaultValues: {
      message: '',
      is_major: false,
    },
  });

  // --------------------------------------------

  const submitHandler = async (data: UpdateAssetFormData) => {
    const { versions: downloadedVersions } = await window.api.ipc('assets:list-downloaded', null);
    const downloaded = downloadedVersions.find(({ asset_id }) => asset_id === uuid);

    if (!downloaded) {
      console.error('No downloaded version found for asset', uuid);
      return;
    }

    // Calling fetchClient.POST()
    await window.api.ipc('assets:commit-changes', { asset_id: uuid, semver: downloaded.semver });

    await refetchSearch();

    // Combine assetFiles from state with form data
    if (afterSubmit) afterSubmit(data); // Call the onSubmit function provided by props
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <div className="mt-4">
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Commit Message
        </label>
        <input
          type="text"
          id="message"
          className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Enter commit message"
          {...register('message', { required: true })}
        />
      </div>

      <label className="mt-4 flex flex-row items-center gap-3">
        <div className="mt-1">
          <input
            type="checkbox"
            className="checkbox shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            {...register('is_major')}
          />
        </div>
        <div className="block text-sm font-medium text-gray-700">
          Is This a Major Version Update?
        </div>
      </label>

      <div className="mt-4">
        <button type="submit" className="btn btn-primary">
          Submit Changes
        </button>
      </div>
    </form>
  );
}
