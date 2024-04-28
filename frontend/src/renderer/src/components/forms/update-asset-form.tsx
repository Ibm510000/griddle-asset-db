import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useSelectedAsset } from '@renderer/hooks/use-asset-select';
import useDownloads from '@renderer/hooks/use-downloads';
import TextInput from '../input/text-input';

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
  const { commitChanges } = useDownloads();
  const { mutate: mutateSelectedAsset } = useSelectedAsset();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UpdateAssetFormData>({
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
    try {
      await commitChanges({
        asset_id: uuid,
        semver: downloaded.semver,
        message: data.message,
        is_major: data.is_major,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? `${err.message}.` : 'Something went wrong committing changes.',
      );
    }

    // refetch selected asset in case it's the one we updated
    mutateSelectedAsset();

    // Combine assetFiles from state with form data
    if (afterSubmit) afterSubmit(data); // Call the onSubmit function provided by props
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <TextInput
        label="Commit Message"
        placeholder="Add a mug on the table"
        {...register('message', { required: true })}
      />

      <label className="mt-4 flex flex-row items-center gap-3">
        <div className="mt-1">
          <input
            type="checkbox"
            className="checkbox shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            {...register('is_major')}
          />
        </div>
        <div className="block text-sm font-medium text-base-content/80">
          Is This a Major Version Update?
        </div>
      </label>

      <div className="mt-6 flex w-full justify-center">
        <button type="submit" className="btn btn-primary btn-wide" disabled={isSubmitting}>
          Submit Changes
          {isSubmitting && <span className="loading loading-spinner ml-2" />}
        </button>
      </div>
    </form>
  );
}
