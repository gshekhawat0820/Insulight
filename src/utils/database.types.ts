export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      glucose_readings: {
        Row: {
          id: string
          created_at: string
          user_id: string
          glucose_level: number
          timestamp: string
          notes?: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          glucose_level: number
          timestamp: string
          notes?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          glucose_level?: number
          timestamp?: string
          notes?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          target_range_min?: number
          target_range_max?: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          target_range_min?: number
          target_range_max?: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          target_range_min?: number
          target_range_max?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}