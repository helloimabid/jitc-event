
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
      events: {
        Row: {
          id: string
          title: string
          description: string
          category: 'workshop' | 'competition' | 'fest'
          date: string
          location: string
          image: string | null
          rules: string | null
          fee: number | null
          capacity: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: 'workshop' | 'competition' | 'fest'
          date: string
          location: string
          image?: string | null
          rules?: string | null
          fee?: number | null
          capacity?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: 'workshop' | 'competition' | 'fest'
          date?: string
          location?: string
          image?: string | null
          rules?: string | null
          fee?: number | null
          capacity?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      event_form_fields: {
        Row: {
          id: string
          event_id: string
          label: string
          type: 'text' | 'email' | 'number' | 'select' | 'checkbox'
          required: boolean
          options: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          label: string
          type: 'text' | 'email' | 'number' | 'select' | 'checkbox'
          required: boolean
          options?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          label?: string
          type?: 'text' | 'email' | 'number' | 'select' | 'checkbox'
          required?: boolean
          options?: string[] | null
          created_at?: string
        }
      }
      fest_segments: {
        Row: {
          id: string
          event_id: string
          name: string
          description: string
          rules: string | null
          fee: number | null
          capacity: number | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          description: string
          rules?: string | null
          fee?: number | null
          capacity?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          description?: string
          rules?: string | null
          fee?: number | null
          capacity?: number | null
          created_at?: string
        }
      }
      segment_form_fields: {
        Row: {
          id: string
          segment_id: string
          label: string
          type: 'text' | 'email' | 'number' | 'select' | 'checkbox'
          required: boolean
          options: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          segment_id: string
          label: string
          type: 'text' | 'email' | 'number' | 'select' | 'checkbox'
          required: boolean
          options?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          segment_id?: string
          label?: string
          type?: 'text' | 'email' | 'number' | 'select' | 'checkbox'
          required?: boolean
          options?: string[] | null
          created_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          event_id: string
          segment_id: string | null
          user_data: Json
          timestamp: string
          payment_status: 'pending' | 'completed' | 'failed' | null
          payment_method: 'bkash' | null
          transaction_id: string | null
        }
        Insert: {
          id?: string
          event_id: string
          segment_id?: string | null
          user_data: Json
          timestamp?: string
          payment_status?: 'pending' | 'completed' | 'failed' | null
          payment_method?: 'bkash' | null
          transaction_id?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          segment_id?: string | null
          user_data?: Json
          timestamp?: string
          payment_status?: 'pending' | 'completed' | 'failed' | null
          payment_method?: 'bkash' | null
          transaction_id?: string | null
        }
      }
      admins: {
        Row: {
          id: string
          username: string
          password_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          created_at?: string
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
