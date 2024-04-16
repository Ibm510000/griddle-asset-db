import { AnimatePresence, motion } from 'framer-motion';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router-dom';

// import { useSelectedAsset } from '@renderer/hooks/use-asset-select';
// import useDownloads from '@renderer/hooks/use-downloads';
import Label from '../input/label';
import TextInput from '../input/text-input';

export interface NewUserFormData {
  firstName: string; // first name
  lastName: string; // last name
  pennkey: string; // username
  school: 'sas' | 'seas' | 'wharton';
  password: string; // password
}

interface NewUserFormProps {
  afterSubmit?: SubmitHandler<NewUserFormData>;
}

// POST to /api/v1/assets/{uuid}/versions - Upload new version for a given asset
export default function NewUserForm({ afterSubmit }: NewUserFormProps) {
  // const { commitChanges } = useDownloads();
  // const { mutate: mutateSelectedAsset } = useSelectedAsset();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    control,
  } = useForm<NewUserFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      pennkey: '',
      school: 'seas',
      password: '',
    },
  });

  // --------------------------------------------

  const submitHandler = async (data: NewUserFormData) => {
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

  const [pennkey, school] = useWatch({ control, name: ['pennkey', 'school'] });
  const computedEmail = pennkey ? `${pennkey}@${school}.upenn.edu` : undefined;

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="First Name"
            placeholder="Ben"
            {...register('firstName', { required: true })}
          />

          <TextInput
            label="Last Name"
            placeholder="Franklin"
            {...register('lastName', { required: true })}
          />
        </div>

        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Pennkey"
              placeholder="benfranklin"
              {...register('pennkey', { required: true })}
            />

            <label {...register('school')}>
              <Label label="School" />
              <select className="select select-bordered w-full" {...register('school')}>
                <option value="sas">CAS</option>
                <option value="seas">SEAS</option>
                <option value="wharton">Wharton</option>
              </select>
            </label>
          </div>
          <AnimatePresence initial={false}>
            {computedEmail && (
              <motion.div
                className="overflow-hidden text-center"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
              >
                <div className="mt-4 select-none text-base-content/50">
                  Email: <span className="text-base-content/100">{computedEmail}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <TextInput
          label="Password"
          placeholder="••••••••"
          type="password"
          {...register('password', { required: true })}
        />

        <div className="mt-6 flex w-full justify-center">
          <button type="submit" className="btn btn-primary btn-wide" disabled={isSubmitting}>
            Create Account
            {isSubmitting && <span className="loading loading-spinner ml-2" />}
          </button>
        </div>

        <Link
          to="/user-login"
          className="mx-auto text-center text-primary/80 underline hover:text-primary/100"
        >
          Already have an account? Log in here.
        </Link>
      </div>
    </form>
  );
}
