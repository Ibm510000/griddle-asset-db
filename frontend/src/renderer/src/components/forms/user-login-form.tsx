import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import useAuth from '@renderer/hooks/use-auth';
import TextInput from '../input/text-input';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// TODO: add more robust validation
const userLoginFormSchema = z.object({
  pennkey: z.string().min(1, 'Please enter your pennkey'),
  password: z.string().min(1, 'Please enter your password'),
});

export type UserLoginFormData = z.infer<typeof userLoginFormSchema>;

export default function UserLoginForm({
  afterSubmit,
}: {
  afterSubmit?: SubmitHandler<UserLoginFormData>;
}) {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<UserLoginFormData>({
    defaultValues: {
      pennkey: '',
      password: '',
    },
    resolver: zodResolver(userLoginFormSchema),
  });

  // --------------------------------------------

  const submitHandler = async (data: UserLoginFormData) => {
    try {
      const result = await login(data.pennkey, data.password);

      // check if login is incorrect
      if (!result.ok) {
        // Show error message
        toast.error(`${result.error}.`);
        return;
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
          errorMessage={errors.pennkey?.message}
        />

        <TextInput
          label="Password"
          placeholder="••••••••"
          type="password"
          {...register('password', { required: true })}
          errorMessage={errors.password?.message}
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
