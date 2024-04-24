import { useCallback } from 'react';
import useSWR from 'swr';
import { create } from 'zustand';

import fetchClient from '@renderer/lib/fetch-client';
import { AssetCreate } from '../types';
import { getAuthToken } from '@renderer/lib/auth';

interface AssetSelectState {
  selectedId: string | null;
  setSelected(assetId: string | null, version: string | null): void;
  selectedVersion: string | null;
}

export const useAssetSelectStore = create<AssetSelectState>((set) => ({
  selectedId: null,
  setSelected: (assetId, version) => set((state) => ({ ...state, selectedId: assetId, selectedVersion: version })),
  selectedVersion: null,
}));

export function useSelectedAsset() {
  const selectedId = useAssetSelectStore((state) => state.selectedId)

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    selectedId !== null ? (['/api/v1/assets/{uuid}', { selectedId }] as const) : null,
    async ([url, { selectedId }]) => {
      const { data, error, response } = await fetchClient.GET(url, {
        params: { path: { uuid: selectedId } },
      });

      if (error) throw error;
      if (!response.status.toString().startsWith('2'))
        throw new Error(`Non-OK response with code ${response.status}: ${response.statusText}`);

      return data;
    },
  );

  const updateSelectedAsset = useCallback(
    async (asset: AssetCreate) => {
      if (selectedId === null) return;
      await fetchClient.PUT('/api/v1/assets/{uuid}', {
        params: { path: { uuid: selectedId } },
        body: asset,
        headers: { Authorization: `Bearer ${await getAuthToken()}` },
      });
      return mutate();
    },
    [mutate, selectedId],
  );

  return {
    asset: data?.asset,
    versions: data?.versions,
    latestVersion: data?.versions[0]?.semver,
    error,
    isLoading,
    isValidating,
    updateSelectedAsset,
    mutate,
  };
}
