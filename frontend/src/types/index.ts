export type HealthStatus = 'Good' | 'Fair' | 'Poor'

export interface Plant {
  id: string
  name: string
  species?: string
  created_at: string
}

export interface DiaryEntry {
  id: string
  plant_id: string
  image_url?: string
  health_status: HealthStatus
  overall_condition: string
  deficiencies: string[]
  tips: string[]
  diary_note?: string
  created_at: string
}
