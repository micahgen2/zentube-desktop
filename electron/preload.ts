import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  minimize: () => Promise<void>;
  maximize: () => Promise<boolean>;
  isMaximized: () => Promise<boolean>;
  close: () => Promise<void>;
  togglePip: (enable: boolean) => Promise<boolean>;
  setAlwaysOnTop: (flag: boolean) => Promise<boolean>;
  proxyFetch: (url: string, options?: RequestInit) => Promise<{ ok: boolean; status: number; data?: any; error?: string }>;
  getTrending: (category?: string) => Promise<{ ok: boolean; data?: any; error?: string }>;
  search: (params: { query: string; sortBy?: string }) => Promise<{ ok: boolean; data?: any; error?: string }>;
  getSuggestions: (query: string) => Promise<{ ok: boolean; data?: string[]; error?: string }>;
  getVideo: (videoId: string) => Promise<{ ok: boolean; data?: any; error?: string }>;
  getComments: (videoId: string) => Promise<{ ok: boolean; data?: any[]; error?: string }>;
  getChannel: (channelId: string) => Promise<{ ok: boolean; data?: any; error?: string }>;
  onWindowStateChange: (callback: (state: { isMaximized: boolean }) => void) => () => void;
}

const electronAPI: ElectronAPI = {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  close: () => ipcRenderer.invoke('window:close'),
  togglePip: (enable: boolean) => ipcRenderer.invoke('window:toggle-pip', enable),
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.invoke('window:set-always-on-top', flag),
  proxyFetch: (url: string, options?: RequestInit) => ipcRenderer.invoke('api:proxy-fetch', { url, options }),
  getTrending: (category?: string) => ipcRenderer.invoke('api:get-trending', category),
  search: (params: { query: string; sortBy?: string }) => ipcRenderer.invoke('api:search', params),
  getSuggestions: (query: string) => ipcRenderer.invoke('api:get-suggestions', query),
  getVideo: (videoId: string) => ipcRenderer.invoke('api:get-video', videoId),
  getComments: (videoId: string) => ipcRenderer.invoke('api:get-comments', videoId),
  getChannel: (channelId: string) => ipcRenderer.invoke('api:get-channel', channelId),
  onWindowStateChange: (callback) => {
    const handler = (_event: any, state: { isMaximized: boolean }) => callback(state);
    ipcRenderer.on('window:state-changed', handler);
    return () => {
      ipcRenderer.removeListener('window:state-changed', handler);
    };
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
