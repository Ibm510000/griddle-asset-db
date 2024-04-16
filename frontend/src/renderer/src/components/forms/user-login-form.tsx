import { SubmitHandler, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

// import { useSelectedAsset } from '@renderer/hooks/use-asset-select';
// import useDownloads from '@renderer/hooks/use-downloads';
import TextInput from '../input/text-input';

export interface UserLoginFormData {
  username: string; // username
  password: string; // password
}

interface UserLoginFormProps {
  afterSubmit?: SubmitHandler<UserLoginFormData>;
}

// POST to /api/v1/assets/{uuid}/versions - Upload new version for a given asset
export default function UserLoginForm({ afterSubmit }: UserLoginFormProps) {
  // const { commitChanges } = useDownloads();
  // const { mutate: mutateSelectedAsset } = useSelectedAsset();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UserLoginFormData>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // --------------------------------------------

  const submitHandler = async (data: UserLoginFormData) => {
    // const { versions: downloadedVersions } = await window.api.ipc('assets:list-downloaded', null);
    // const downloaded = downloadedVersions.find(({ asset_id }) => asset_id === uuid);

    // if (!downloaded) {
    //   console.error('No downloaded version found for asset', uuid);
    //   return;
    // }

    // // Calling fetchClient.POST()
    // await commitChanges({
    //   asset_id: uuid,
    //   semver: downloaded.semver,
    //   message: data.message,
    //   is_major: data.is_major,
    // });

    // // refetch selected asset in case it's the one we updated
    // mutateSelectedAsset();

    // Combine assetFiles from state with form data
    if (afterSubmit) afterSubmit(data); // Call the onSubmit function provided by props
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <div className="flex flex-col gap-4">
        <TextInput
          label="Pennkey"
          placeholder="benfranklin"
          {...register('username', { required: true })}
        />

        <TextInput
          label="Password"
          placeholder="••••••••"
          type="password"
          {...register('password', { required: true })}
        />

        <div className="mt-6 flex w-full justify-center">
          <button type="submit" className="btn btn-primary btn-wide" disabled={isSubmitting}>
            Login
            {isSubmitting && <span className="loading loading-spinner ml-2" />}
          </button>
        </div>

        <Link
          to="/new-user"
          className="mx-auto text-center text-primary/80 underline hover:text-primary/100"
        >
          Don&apos;t have a Griddle account? Create one here.
        </Link>
      </div>
    </form>
  );
}
