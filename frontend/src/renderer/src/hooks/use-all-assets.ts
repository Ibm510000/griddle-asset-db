import useSWR, { useSWRConfig } from 'swr';

import fetchClient from '@renderer/lib/fetch-client';

export function useAssetNames() {
  const {
    data: assetNames,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR('/api/v1/assets/names', async () => {
    const { data, error, response } = await fetchClient.GET('/api/v1/assets/names');

    if (error) throw error;
    if (!response.status.toString().startsWith('2'))
      throw new Error(`Non-OK response with code ${response.status}: ${response.statusText}`);

    return data;
  });

  return { assetNames, error, isLoading, isValidating, mutate };
}

// (probably don't need this function)
export function useAssetNamesRefetch() {
  const { mutate } = useSWRConfig();

  return async () => {
    await mutate('/api/v1/assets/names');
  };
}
