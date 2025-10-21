import { create } from 'zustand';
import { systemApi } from '@/services/api';

interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  activeActors: number;
  totalRequests: number;
}

interface SystemStatus {
  apiServer: 'online' | 'offline';
  webSocket: 'connected' | 'disconnected';
  database: 'healthy' | 'unhealthy';
  llmService: 'available' | 'limited' | 'unavailable';
}

interface SystemState {
  stats: SystemStats | null;
  status: SystemStatus | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchStats: () => Promise<void>;
  fetchStatus: () => Promise<void>;
}

export const useSystemStore = create<SystemState>((set) => ({
  stats: null,
  status: null,
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await systemApi.getStats();
      set({ stats: response.data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch system stats', loading: false });
    }
  },

  fetchStatus: async () => {
    set({ loading: true, error: null });
    try {
      const response = await systemApi.getStatus();
      set({ status: response.data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch system status', loading: false });
    }
  },
}));
