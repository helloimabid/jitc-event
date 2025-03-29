export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string | null
          id: string
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          password_hash: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
      event_form_fields: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          label: string
          options: string[] | null
          required: boolean
          type: string
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          label: string
          options?: string[] | null
          required?: boolean
          type: string
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          label?: string
          options?: string[] | null
          required?: boolean
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_form_fields_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          category: string
          created_at: string | null
          date: string
          description: string
          fee: number | null
          id: string
          image: string | null
          location: string
          rules: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          category: string
          created_at?: string | null
          date: string
          description: string
          fee?: number | null
          id?: string
          image?: string | null
          location: string
          rules?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          category?: string
          created_at?: string | null
          date?: string
          description?: string
          fee?: number | null
          id?: string
          image?: string | null
          location?: string
          rules?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fest_segments: {
        Row: {
          capacity: number | null
          created_at: string | null
          description: string
          event_id: string | null
          fee: number | null
          id: string
          name: string
          rules: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          description: string
          event_id?: string | null
          fee?: number | null
          id?: string
          name: string
          rules?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          description?: string
          event_id?: string | null
          fee?: number | null
          id?: string
          name?: string
          rules?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fest_segments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          event_id: string | null
          id: string
          payment_method: string | null
          payment_status: string | null
          segment_id: string | null
          timestamp: string | null
          transaction_id: string | null
          user_data: Json
        }
        Insert: {
          event_id?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          segment_id?: string | null
          timestamp?: string | null
          transaction_id?: string | null
          user_data: Json
        }
        Update: {
          event_id?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          segment_id?: string | null
          timestamp?: string | null
          transaction_id?: string | null
          user_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "fest_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      segment_form_fields: {
        Row: {
          created_at: string | null
          id: string
          label: string
          options: string[] | null
          required: boolean
          segment_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          options?: string[] | null
          required?: boolean
          segment_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          options?: string[] | null
          required?: boolean
          segment_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "segment_form_fields_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "fest_segments"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
