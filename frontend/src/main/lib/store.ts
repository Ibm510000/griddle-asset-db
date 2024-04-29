import Store from 'electron-store';
import { DownloadedEntry } from '../../types/ipc';
import { app } from 'electron';
import path from 'node:path';

interface StoreSchema {
  versions: DownloadedEntry[];
  downloadFolder: string;
  authToken: string | null;
}

const defaults: StoreSchema = {
  versions: [],
  downloadFolder: path.join(app.getPath('documents'), 'Griddle'),
  authToken: null,
};

const store = new Store<StoreSchema>({ defaults });

export default store;
