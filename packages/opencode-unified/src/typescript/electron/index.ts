/**
 * Electron Module - Electron Main Process Integration
 */

// Electron exports will be added here
export const ELECTRON_VERSION = '1.0.0';

// Placeholder for Electron functionality
export interface ElectronConfig {
  width: number;
  height: number;
  webSecurity: boolean;
  nodeIntegration: boolean;
  contextIsolation: boolean;
}

export const defaultElectronConfig: ElectronConfig = {
  width: 1200,
  height: 800,
  webSecurity: true,
  nodeIntegration: false,
  contextIsolation: true,
};
