import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import useAuth from '@renderer/hooks/use-auth';
import TextInput from '../input/text-input';

export interface UserLoginFormData {
  pennkey: string; // pennkey
  password: string; // password
}

interface UserLoginFormProps {
  afterSubmit?: SubmitHandler<UserLoginFormData>;
}

export default function UserLoginForm({ afterSubmit }: UserLoginFormProps) {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UserLoginFormData>({
    defaultValues: {
      pennkey: '',
      password: '',
    },
  });

  // --------------------------------------------

  const submitHandler = async (data: UserLoginFormData) => {
    try {
      const result = await login(data.pennkey, data.password);
      // check if login is incorrect  
      if (!result.ok) {
        // Show error message
        toast.error(result.error); 
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? `${err.message}.` : 'Something went wrong committing changes.',
      );
      return;
    }

   

    

    if (afterSubmit) afterSubmit(data); // Call the onSubmit function provided by props
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <div className="flex flex-col gap-4">
        <TextInput
          label="Pennkey"
          placeholder="benfranklin"
          {...register('pennkey', { required: true })}
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
