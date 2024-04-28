import { getAuthToken } from '@renderer/lib/auth';
import fetchClient from '../lib/fetch-client';
import useSWR from 'swr';

export default function useAuth() {
  const {
    data: authStatus,
    error,
    mutate,
  } = useSWR('/api/v1/users/me', async () => {
    // Check if we have an auth token registered
    const authToken = await getAuthToken();
    if (!authToken) {
      return { loggedIn: false as const };
    }

    // Fetch the user data!!
    const { data, error, response } = await fetchClient.GET('/api/v1/users/me', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!error && response.status === 401) {
      return { loggedIn: false as const };
    }
    if (error || response.status !== 200) {
      return undefined;
    }
    return { loggedIn: true as const, user: data };
  });

  const login = async (pennkey: string, password: string) => {
    const result = await window.api.ipc('auth:login', { pennkey, password });

    await mutate();
    return result;
  };

  const logout = async () => {
    const result = await window.api.ipc('auth:logout', null);

    await mutate();
    return result;
  };

  return {
    loggedIn: authStatus?.loggedIn,
    user: authStatus?.loggedIn ? authStatus.user : undefined,
    isLoading: !authStatus && !error,
    login,
    logout,
  };
}
