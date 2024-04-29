import fetchClient from './fetch-client';
import store from './store';

export function getAuthToken() {
  return store.get('authToken');
}

function setAuthToken(token: string) {
  store.set('authToken', token);
}

function clearAuthToken() {
  store.set('authToken', null);
}

export async function getCurrentUser() {
  if (!getAuthToken()) {
    return { status: 'logged-out' as const };
  }

  const { data, error, response } = await fetchClient.GET('/api/v1/users/me', {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  });

  if (!error && response.status === 401) {
    return { status: 'logged-out' as const };
  }

  if (error || response.status !== 200) {
    throw new Error('Failed to fetch user data');
  }

  return { user: data, status: 'logged-in' as const };
}

export async function login(pennkey: string, password: string) {
  const { data, error, response } = await fetchClient.POST('/api/v1/users/token', {
    body: { username: pennkey, password },
    bodySerializer(body) {
      const formData = new FormData();
      formData.append('username', body.username);
      formData.append('password', body.password);
      return formData;
    },
  });

  if (error) {
    if (response.status.toString().startsWith('4')) {
      throw new Error(error.detail as unknown as string);
    }
    throw new Error('Failed to log in');
  }

  setAuthToken(data.access_token);
}

export async function logout() {
  clearAuthToken();
}
