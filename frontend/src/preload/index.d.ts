import { ElectronAPI } from '@electron-toolkit/preload';
import { GriddleIpcRequest, GriddleIpcKey, GriddleIpcResponse } from '../types/ipc';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      ipc: <K extends GriddleIpcKey>(
        key: K,
        request: GriddleIpcRequest<K>,
      ) => Promise<GriddleIpcResponse<K>>;
    };
  }
}
