// Shared types for IPC interaction!

import type { WebContents } from 'electron';
import type { components } from './schema';

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

type Version = components['schemas']['Version'];
type Asset = components['schemas']['Asset'];
type VersionCreate = components['schemas']['Version'];

type DownloadedEntry = {
  asset_id: string;
  // null semver means no associated version
  semver: string | null;
  folderName: string;
};

type GriddleIpcSchema = {
  'assets:list-downloaded': {
    request: null;
    response: { versions: DownloadedEntry[] };
  };
  'assets:download-asset': {
    request: { asset_id: string };
    response: { ok: boolean };
  };
  'assets:create-initial-version': {
    request: { asset_id: string; asset_name: string };
    response: { ok: boolean };
  };
  'assets:download-version': {
    request: { asset_id: string; semver: string };
    response: { ok: boolean };
  };
  'assets:remove-version': {
    request: { asset_id: string; semver: string | null };
    response: { ok: boolean };
  };
  'assets:commit-changes': {
    request: { asset_id: string; semver: string | null };
    response: { ok: boolean };
  };
  'assets:open-folder': {
    request: { asset_id: string; semver: string | null };
    response: { ok: boolean };
  };
};

export type GriddleIpcKey = keyof GriddleIpcSchema;

type GriddleIpcRequest<K extends GriddleIpcKey> = GriddleIpcSchema[K]['request'];
type GriddleIpcResponse<K extends GriddleIpcKey> = GriddleIpcSchema[K]['response'];

type MessageHandlers = {
  [key in GriddleIpcKey]: (
    sender: WebContents,
    request: GriddleIpcRequest<key>,
  ) => Promise<GriddleIpcResponse<key>>;
};
