import { create } from 'zustand';
import { actorsApi } from '@/services/api';

interface Actor {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'error';
  lastTick: Date;
  ticks: number;
}

interface ActorsState {
  actors: Actor[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchActors: () => Promise<void>;
  createActor: (data: any) => Promise<void>;
  updateActor: (id: string, data: any) => Promise<void>;
  deleteActor: (id: string) => Promise<void>;
  tickActor: (id: string) => Promise<void>;
}

export const useActorsStore = create<ActorsState>((set, get) => ({
  actors: [],
  loading: false,
  error: null,

  fetchActors: async () => {
    set({ loading: true, error: null });
    try {
      const response = await actorsApi.getAll();
      set({ actors: response.data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch actors', loading: false });
    }
  },

  createActor: async (data) => {
    try {
      await actorsApi.create(data);
      get().fetchActors();
    } catch (error) {
      set({ error: 'Failed to create actor' });
    }
  },

  updateActor: async (id, data) => {
    try {
      await actorsApi.update(id, data);
      get().fetchActors();
    } catch (error) {
      set({ error: 'Failed to update actor' });
    }
  },

  deleteActor: async (id) => {
    try {
      await actorsApi.delete(id);
      set((state) => ({
        actors: state.actors.filter((actor) => actor.id !== id),
      }));
    } catch (error) {
      set({ error: 'Failed to delete actor' });
    }
  },

  tickActor: async (id) => {
    try {
      await actorsApi.tick(id);
      get().fetchActors();
    } catch (error) {
      set({ error: 'Failed to tick actor' });
    }
  },
}));
