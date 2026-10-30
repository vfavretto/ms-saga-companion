import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getMemoryState: () => ipcRenderer.invoke('get-memory-state'),
  onMemoryUpdate: (callback: (state: any) => void) => {
    ipcRenderer.on('memory-update', (_event, value) => callback(value));
  },
  pineDiagnostics: () => ipcRenderer.invoke('pine-diagnostics'),
  pineFirstScan: (value: number, size: 1 | 2 | 4) => ipcRenderer.invoke('pine-first-scan', value, size),
  pineNextScan: (value: number) => ipcRenderer.invoke('pine-next-scan', value),
  pineReadHex: (addr: number, len: number) => ipcRenderer.invoke('pine-read-hex', addr, len),
  getMemoryMap: () => ipcRenderer.invoke('get-memory-map'),
  setMemoryMap: (patch: Record<string, number>) => ipcRenderer.invoke('set-memory-map', patch),
  resetMemoryMap: () => ipcRenderer.invoke('reset-memory-map'),
});
