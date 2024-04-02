import type { MessageHandlers } from '../types/ipc';
import {
  commitChanges,
  createInitialVersion,
  downloadVersion,
  getStoredVersions,
  removeVersion,
} from './lib/local-assets';

// Types for these can be found in `src/types/ipc.d.ts`
const messageHandlers: MessageHandlers = {
  'assets:list-downloaded': async () => {
    // console.log('getting downloaded:', getStoredVersions());
    return { ok: true, versions: getStoredVersions() };
  },
  'assets:download-asset': async (_, { asset_id }) => {
    // TODO
    console.log(`Downloading latest version of asset ${asset_id}`);
    return { ok: true };
  },
  'assets:create-initial-version': async (_, { asset_id, asset_name }) => {
    await createInitialVersion({ asset_id, asset_name });
    return { ok: true };
  },
  'assets:download-version': async (_, { asset_id, semver }) => {
    console.log(`Downloading asset ${asset_id}`);
    await downloadVersion({ asset_id, semver });
    return { ok: true };
  },
  'assets:remove-version': async (_, { asset_id, semver }) => {
    await removeVersion({ asset_id, semver });
    return { ok: true };
  },
  'assets:commit-changes': async (_, { asset_id, semver }) => {
    console.log(`Committing changes for ${asset_id}@${semver}`);
    await commitChanges(asset_id, semver);
    return { ok: true };
  },
  'assets:open-folder': async (_, { asset_id, semver }) => {
    // TODO
    console.log(`Opening folder for ${asset_id}@${semver}`);
    return { ok: true };
  },
};

export default messageHandlers;
