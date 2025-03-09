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
      ai_insights: {
        Row: {
          id: string
          created_at: string
          user_id: string
          insights: string
          data_timeframe_start: string
          data_timeframe_end: string
          title: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          insights: string
          data_timeframe_start: string
          data_timeframe_end: string
          title: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          insights?: string
          data_timeframe_start?: string
          data_timeframe_end?: string
          title?: string
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