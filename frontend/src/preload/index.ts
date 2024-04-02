import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { GriddleIpcKey, GriddleIpcRequest, GriddleIpcResponse } from '../types/ipc';

// Custom APIs for renderer
const api = {
  ipc: <K extends GriddleIpcKey>(key: K, request: GriddleIpcRequest<K>) => {
    return ipcRenderer.invoke(key, request) as Promise<GriddleIpcResponse<K>>;
  },
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
