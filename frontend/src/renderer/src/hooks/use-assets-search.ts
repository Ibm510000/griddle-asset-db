import { useDebounce } from '@uidotdev/usehooks';
import useSWR, { useSWRConfig } from 'swr';
import { create } from 'zustand';

import fetchClient from '@renderer/lib/fetch-client';

interface SearchParamsState {
  search: string;
  keywords: string[];
  setSearch(query: string): void;
  // TODO: setFilters
}

export const useSearchParamsStore = create<SearchParamsState>((set) => ({
  search: '',
  keywords: [],
  setSearch: (query: string) => set((state) => ({ ...state, search: query })),
}));

const useKey = () => {
  const searchParams = useSearchParamsStore();
  // debounce so we don't refetch every 20 ms
  const debouncedParams = useDebounce(searchParams, 200);

  return ['/api/v1/assets/', debouncedParams] as const;
};

export function useAssetsSearch() {
  const {
    data: assets,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(useKey(), async ([url, { search, keywords }]) => {
    const { data, error, response } = await fetchClient.GET(url, {
      params: {
        query: {
          keywords: keywords.join(','),
          search: search || null,
          sort: 'date_dsc',
          // offset: 0,
        },
      },
    });

    if (error) throw error;
    if (!response.status.toString().startsWith('2'))
      throw new Error(`Non-OK response with code ${response.status}: ${response.statusText}`);

    return data;
  });

  return { assets, error, isLoading, isValidating, mutate };
}

export function useAssetsSearchRefetch() {
  const { mutate } = useSWRConfig();
  const key = useKey();

  return async () => {
    await mutate(key);
  };
}
