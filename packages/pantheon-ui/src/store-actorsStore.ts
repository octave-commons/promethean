import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import type { ActorWithStatus, LLMActor, ChatMessage } from '@/types'
import { apiClient } from '@/services/api'

interface ActorsState {
  actors: ActorWithStatus[]
  selectedActor: ActorWithStatus | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchActors: () => Promise<void>
  fetchActor: (actorId: string) => Promise<void>
  createActor: (config: any) => Promise<void>
  updateActor: (actorId: string, config: any) => Promise<void>
  deleteActor: (actorId: string) => Promise<void>
  tickActor: (actorId: string) => Promise<void>
  selectActor: (actor: ActorWithStatus | null) => void
  updateActorStatus: (actorId: string, status: Partial<ActorWithStatus>) => void
  clearError: () => void
}

export const useActorsStore = create<ActorsState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      actors: [],
      selectedActor: null,
      loading: false,
      error: null,

      fetchActors: async () => {
        set({ loading: true, error: null })
        try {
          const actors = await apiClient.getActors()
          set({ actors, loading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch actors',
            loading: false 
          })
        }
      },

      fetchActor: async (actorId: string) => {
        set({ loading: true, error: null })
        try {
          const actor = await apiClient.getActor(actorId)
          set({ selectedActor: actor, loading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch actor',
            loading: false 
          })
        }
      },

      createActor: async (config) => {
        set({ loading: true, error: null })
        try {
          const newActor = await apiClient.createActor(config)
          set(state => ({ 
            actors: [...state.actors, newActor as ActorWithStatus],
            loading: false 
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create actor',
            loading: false 
          })
        }
      },

      updateActor: async (actorId: string, config) => {
        set({ loading: true, error: null })
        try {
          const updatedActor = await apiClient.updateActor(actorId, config)
          set(state => ({
            actors: state.actors.map(actor => 
              actor.id === actorId ? { ...actor, ...updatedActor } : actor
            ),
            selectedActor: state.selectedActor?.id === actorId 
              ? { ...state.selectedActor, ...updatedActor }
              : state.selectedActor,
            loading: false
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update actor',
            loading: false 
          })
        }
      },

      deleteActor: async (actorId: string) => {
        set({ loading: true, error: null })
        try {
          await apiClient.deleteActor(actorId)
          set(state => ({
            actors: state.actors.filter(actor => actor.id !== actorId),
            selectedActor: state.selectedActor?.id === actorId ? null : state.selectedActor,
            loading: false
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete actor',
            loading: false 
          })
        }
      },

      tickActor: async (actorId: string) => {
        try {
          await apiClient.tickActor(actorId)
          // Update the last tick time
          set(state => ({
            actors: state.actors.map(actor => 
              actor.id === actorId 
                ? { ...actor, lastTick: Date.now(), status: 'processing' as const }
                : actor
            ),
            selectedActor: state.selectedActor?.id === actorId 
              ? { ...state.selectedActor, lastTick: Date.now(), status: 'processing' as const }
              : state.selectedActor
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to tick actor'
          })
        }
      },

      selectActor: (actor) => {
        set({ selectedActor: actor })
      },

      updateActorStatus: (actorId: string, statusUpdate) => {
        set(state => ({
          actors: state.actors.map(actor => 
            actor.id === actorId ? { ...actor, ...statusUpdate } : actor
          ),
          selectedActor: state.selectedActor?.id === actorId 
            ? { ...state.selectedActor, ...statusUpdate }
            : state.selectedActor
        }))
      },

      clearError: () => {
        set({ error: null })
      },
    })),
    { name: 'actors-store' }
  )
)