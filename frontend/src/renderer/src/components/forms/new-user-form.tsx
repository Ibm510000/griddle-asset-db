import { AnimatePresence, motion } from 'framer-motion';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import useAuth from '@renderer/hooks/use-auth';
import fetchClient from '@renderer/lib/fetch-client';
import Label from '../input/label';
import TextInput from '../input/text-input';

export interface NewUserFormData {
  first_name: string; // first name
  last_name: string; // last name
  pennkey: string; // pennkey
  school: 'sas' | 'seas' | 'wharton';
  password: string; // password
}

interface NewUserFormProps {
  afterSubmit?: SubmitHandler<NewUserFormData>;
}

export default function NewUserForm({ afterSubmit }: NewUserFormProps) {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    control,
  } = useForm<NewUserFormData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      pennkey: '',
      school: 'seas',
      password: '',
    },
  });

  // --------------------------------------------

  const submitHandler = async (data: NewUserFormData) => {
    // Create the user
    try {
      const { error } = await fetchClient.POST('/api/v1/users/', {
        body: data,
      });
      if (error) throw new Error(error.detail?.[0].msg);
    } catch (e) {
      toast.error(
        e instanceof Error ? `${e.message}.` : 'Something went wrong creating an account.',
      );
      return;
    }

    // Log the user in
    const result = await login(data.pennkey, data.password);
    if (!result.ok) {
      alert(result.error);
      return;
    }

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
            {...register('first_name', { required: true })}
          />

          <TextInput
            label="Last Name"
            placeholder="Franklin"
            {...register('last_name', { required: true })}
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
