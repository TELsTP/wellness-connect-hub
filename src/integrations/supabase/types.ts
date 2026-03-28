export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      accreditation_logs: {
        Row: {
          certificate_id: string | null
          chat_id: string | null
          confidence_score: number | null
          created_at: string | null
          doctor_override: string | null
          domain: string
          id: string
          level: string
        }
        Insert: {
          certificate_id?: string | null
          chat_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          doctor_override?: string | null
          domain: string
          id?: string
          level: string
        }
        Update: {
          certificate_id?: string | null
          chat_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          doctor_override?: string | null
          domain?: string
          id?: string
          level?: string
        }
        Relationships: [
          {
            foreignKeyName: "accreditation_logs_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string | null
          date: string
          doctor_id: string | null
          id: string
          notes: string | null
          patient_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      architect_handshakes: {
        Row: {
          action_type: string
          architect_id: string | null
          handshake_code: string | null
          hub_id: string | null
          id: string
          success: boolean | null
          timestamp: string | null
        }
        Insert: {
          action_type: string
          architect_id?: string | null
          handshake_code?: string | null
          hub_id?: string | null
          id?: string
          success?: boolean | null
          timestamp?: string | null
        }
        Update: {
          action_type?: string
          architect_id?: string | null
          handshake_code?: string | null
          hub_id?: string | null
          id?: string
          success?: boolean | null
          timestamp?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          accreditation_level: string | null
          created_at: string | null
          domain: string | null
          id: string
          is_anonymous: boolean | null
          media: Json | null
          messages: Json
          portal_type: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          accreditation_level?: string | null
          created_at?: string | null
          domain?: string | null
          id?: string
          is_anonymous?: boolean | null
          media?: Json | null
          messages?: Json
          portal_type?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          accreditation_level?: string | null
          created_at?: string | null
          domain?: string | null
          id?: string
          is_anonymous?: boolean | null
          media?: Json | null
          messages?: Json
          portal_type?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          availability: string | null
          bio: string | null
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          rating: number | null
          specialization: string
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          rating?: number | null
          specialization: string
        }
        Update: {
          availability?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          rating?: number | null
          specialization?: string
        }
        Relationships: []
      }
      hubs: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          pillar: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          pillar: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          pillar?: string
          status?: string | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          hub_id: string | null
          id: string
          tags: string[] | null
          title: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          hub_id?: string | null
          id?: string
          tags?: string[] | null
          title: string
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          hub_id?: string | null
          id?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      media_access: {
        Row: {
          chat_id: string | null
          consent_given: boolean | null
          created_at: string | null
          expires_at: string | null
          file_path: string
          file_type: string | null
          id: string
          shared_with: string | null
          uploaded_by: string | null
        }
        Insert: {
          chat_id?: string | null
          consent_given?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          file_path: string
          file_type?: string | null
          id?: string
          shared_with?: string | null
          uploaded_by?: string | null
        }
        Update: {
          chat_id?: string | null
          consent_given?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          file_path?: string
          file_type?: string | null
          id?: string
          shared_with?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_access_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_access_shared_with_fkey"
            columns: ["shared_with"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_access_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      multimedia_stream: {
        Row: {
          active: boolean | null
          created_at: string | null
          hub_id: string | null
          id: string
          stream_url: string | null
          title: string
          type: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          hub_id?: string | null
          id?: string
          stream_url?: string | null
          title: string
          type?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          hub_id?: string | null
          id?: string
          stream_url?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "multimedia_stream_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      omnicog_memory: {
        Row: {
          context_key: string
          id: string
          intelligence_level: number | null
          last_accessed: string | null
          memory_data: Json
        }
        Insert: {
          context_key: string
          id?: string
          intelligence_level?: number | null
          last_accessed?: string | null
          memory_data: Json
        }
        Update: {
          context_key?: string
          id?: string
          intelligence_level?: number | null
          last_accessed?: string | null
          memory_data?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          preferred_language: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          preferred_language?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          preferred_language?: string | null
          role?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          ai_contributions: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          impact_area: string | null
          keywords: string[] | null
          owner_id: string | null
          status: string | null
          title: string
        }
        Insert: {
          ai_contributions?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact_area?: string | null
          keywords?: string[] | null
          owner_id?: string | null
          status?: string | null
          title: string
        }
        Update: {
          ai_contributions?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact_area?: string | null
          keywords?: string[] | null
          owner_id?: string | null
          status?: string | null
          title?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
