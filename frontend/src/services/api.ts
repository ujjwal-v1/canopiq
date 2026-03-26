import axios from 'axios'
import type { Plant, DiaryEntry } from '../types'

const api = axios.create({ baseURL: '/api/v1' })

export const plantApi = {
  list: () => api.get<Plant[]>('/plants/').then(r => r.data),
  create: (name: string, species?: string) =>
    api.post<Plant>('/plants/', { name, species }).then(r => r.data),
  get: (id: string) => api.get<Plant>(`/plants/${id}`).then(r => r.data),
  analyze: (plantId: string, imageFile: File) => {
    const form = new FormData()
    form.append('image', imageFile)
    return api.post<DiaryEntry>(`/plants/${plantId}/analyze`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },
  getDiary: (plantId: string) =>
    api.get<DiaryEntry[]>(`/plants/${plantId}/diary`).then(r => r.data),
}
