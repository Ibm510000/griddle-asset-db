import Store from 'electron-store';
import { DownloadedEntry } from '../../types/ipc';
import { app } from 'electron';
import path from 'node:path';

interface GriddleFrontendStoreSchema {
  storeLocation: string;
}

const griddleFrontendDefaults: GriddleFrontendStoreSchema = {
  storeLocation: path.join(app.getPath('documents'), 'Griddle'),
};

// This store is only for this frontend, to control where the main store is
export const griddleFrontendStore = new Store<GriddleFrontendStoreSchema>({
  defaults: griddleFrontendDefaults,
});

interface StoreSchema {
  downloadedAssetVersions: DownloadedEntry[];
  authToken: string | null;
}

const defaults: StoreSchema = {
  downloadedAssetVersions: [],
  authToken: null,
};

// This store keeps track of which asset/version pairings are downloaded
const store = new Store<StoreSchema>({
  defaults,
  cwd: griddleFrontendStore.get('storeLocation'),
  name: 'store',
});

export default store;
