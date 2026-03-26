import { create } from 'zustand'
import type { Plant, DiaryEntry } from '../types'
import { plantApi } from '../services/api'

interface PlantStore {
  plants: Plant[]
  activePlantId: string | null
  diary: DiaryEntry[]
  loading: boolean
  error: string | null
  fetchPlants: () => Promise<void>
  createPlant: (name: string) => Promise<Plant>
  setActivePlant: (id: string) => void
  analyze: (plantId: string, file: File) => Promise<DiaryEntry>
  fetchDiary: (plantId: string) => Promise<void>
  clearError: () => void
}

export const usePlantStore = create<PlantStore>((set, get) => ({
  plants: [],
  activePlantId: null,
  diary: [],
  loading: false,
  error: null,

  fetchPlants: async () => {
    try {
      const plants = await plantApi.list()
      set({ plants })
    } catch {
      set({ error: 'Failed to load plants' })
    }
  },

  createPlant: async (name) => {
    const plant = await plantApi.create(name)
    set(s => ({ plants: [plant, ...s.plants] }))
    return plant
  },

  setActivePlant: (id) => {
    set({ activePlantId: id, diary: [] })
    get().fetchDiary(id)
  },

  analyze: async (plantId, file) => {
    set({ loading: true, error: null })
    try {
      const entry = await plantApi.analyze(plantId, file)
      set(s => ({ diary: [entry, ...s.diary] }))
      return entry
    } catch {
      set({ error: 'Analysis failed. Please try again.' })
      throw new Error('Analysis failed')
    } finally {
      set({ loading: false })
    }
  },

  fetchDiary: async (plantId) => {
    const diary = await plantApi.getDiary(plantId)
    set({ diary: diary ?? [] })
  },

  clearError: () => set({ error: null }),
}))
