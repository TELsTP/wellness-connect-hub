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
    PostgrestVersion: "14.5"
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
      ana_moslem_conversations: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_architect_context: boolean | null
          meta: Json | null
          persona: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_architect_context?: boolean | null
          meta?: Json | null
          persona?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_architect_context?: boolean | null
          meta?: Json | null
          persona?: string
          role?: string
          session_id?: string
        }
        Relationships: []
      }
      ana_moslem_sessions: {
        Row: {
          architect_verified_at: string | null
          created_at: string | null
          emotional_tone: string | null
          ended_at: string | null
          id: string
          is_architect: boolean | null
          last_active_at: string | null
          main_topics: string[] | null
          summary: string | null
        }
        Insert: {
          architect_verified_at?: string | null
          created_at?: string | null
          emotional_tone?: string | null
          ended_at?: string | null
          id: string
          is_architect?: boolean | null
          last_active_at?: string | null
          main_topics?: string[] | null
          summary?: string | null
        }
        Update: {
          architect_verified_at?: string | null
          created_at?: string | null
          emotional_tone?: string | null
          ended_at?: string | null
          id?: string
          is_architect?: boolean | null
          last_active_at?: string | null
          main_topics?: string[] | null
          summary?: string | null
        }
        Relationships: []
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
      architect_master_logs: {
        Row: {
          action_type: string
          architect_id: string
          created_at: string | null
          details: Json | null
          id: string
        }
        Insert: {
          action_type: string
          architect_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Update: {
          action_type?: string
          architect_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      architect_sessions: {
        Row: {
          agents_activated: string[] | null
          architect_id: string | null
          context_key: string | null
          created_at: string | null
          decisions_made: string[] | null
          handshakes_updated: string[] | null
          id: string
          next_steps: string[] | null
          session_date: string
          session_summary: string | null
        }
        Insert: {
          agents_activated?: string[] | null
          architect_id?: string | null
          context_key?: string | null
          created_at?: string | null
          decisions_made?: string[] | null
          handshakes_updated?: string[] | null
          id?: string
          next_steps?: string[] | null
          session_date?: string
          session_summary?: string | null
        }
        Update: {
          agents_activated?: string[] | null
          architect_id?: string | null
          context_key?: string | null
          created_at?: string | null
          decisions_made?: string[] | null
          handshakes_updated?: string[] | null
          id?: string
          next_steps?: string[] | null
          session_date?: string
          session_summary?: string | null
        }
        Relationships: []
      }
      board_meeting_transcripts: {
        Row: {
          id: string
          meeting_id: string
          sort_order: number | null
          speaker_name: string
          timestamp_mark: string
          transcript_text: string
        }
        Insert: {
          id?: string
          meeting_id: string
          sort_order?: number | null
          speaker_name: string
          timestamp_mark: string
          transcript_text: string
        }
        Update: {
          id?: string
          meeting_id?: string
          sort_order?: number | null
          speaker_name?: string
          timestamp_mark?: string
          transcript_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_meeting_transcripts_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "syndicate_board_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          created_at: string | null
          id: string
          owner_id: string | null
          start_time: string
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          owner_id?: string | null
          start_time: string
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          owner_id?: string | null
          start_time?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_architect_message: boolean | null
          language: string | null
          metadata: Json | null
          persona: string
          pillar_context: string | null
          session_id: string
          token_count: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_architect_message?: boolean | null
          language?: string | null
          metadata?: Json | null
          persona: string
          pillar_context?: string | null
          session_id: string
          token_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_architect_message?: boolean | null
          language?: string | null
          metadata?: Json | null
          persona?: string
          pillar_context?: string | null
          session_id?: string
          token_count?: number | null
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
      compliance_sops: {
        Row: {
          best_practices: Json | null
          code: string
          country_scope: string
          created_at: string | null
          created_by: string | null
          full_text_markdown: string | null
          guidelines: Json | null
          id: string
          scope_details: string
          sector: string
          title: string
          updated_at: string | null
        }
        Insert: {
          best_practices?: Json | null
          code: string
          country_scope: string
          created_at?: string | null
          created_by?: string | null
          full_text_markdown?: string | null
          guidelines?: Json | null
          id?: string
          scope_details: string
          sector: string
          title: string
          updated_at?: string | null
        }
        Update: {
          best_practices?: Json | null
          code?: string
          country_scope?: string
          created_at?: string | null
          created_by?: string | null
          full_text_markdown?: string | null
          guidelines?: Json | null
          id?: string
          scope_details?: string
          sector?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_sops_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pmo_members"
            referencedColumns: ["id"]
          },
        ]
      }
      conceptual_frameworks: {
        Row: {
          applications: string | null
          created_at: string | null
          description: string
          id: number
          name: string
          principles: string | null
          relationships: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          applications?: string | null
          created_at?: string | null
          description: string
          id?: number
          name: string
          principles?: string | null
          relationships?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          applications?: string | null
          created_at?: string | null
          description?: string
          id?: number
          name?: string
          principles?: string | null
          relationships?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          is_shared: boolean | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_shared?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_shared?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_appointments: {
        Row: {
          assigned_membership_id: string | null
          assigned_user_id: string | null
          calendar_id: string | null
          calendly_event_id: string | null
          contact_email: string
          contact_id: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          ends_at: string
          google_event_id: string | null
          id: string
          metadata: Json | null
          notes: string | null
          participant_count: number | null
          source: string | null
          starts_at: string
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_membership_id?: string | null
          assigned_user_id?: string | null
          calendar_id?: string | null
          calendly_event_id?: string | null
          contact_email: string
          contact_id?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          ends_at: string
          google_event_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          participant_count?: number | null
          source?: string | null
          starts_at: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_membership_id?: string | null
          assigned_user_id?: string | null
          calendar_id?: string | null
          calendly_event_id?: string | null
          contact_email?: string
          contact_id?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          ends_at?: string
          google_event_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          participant_count?: number | null
          source?: string | null
          starts_at?: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_appointments_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "crm_calendars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_appointments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_availability: {
        Row: {
          calendar_id: string | null
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
        }
        Insert: {
          calendar_id?: string | null
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          start_time: string
        }
        Update: {
          calendar_id?: string | null
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_availability_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "crm_calendars"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_calendar_members: {
        Row: {
          calendar_id: string | null
          created_at: string | null
          id: string
          priority: number | null
          user_google_calendar_id: string | null
          user_id: string
        }
        Insert: {
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          priority?: number | null
          user_google_calendar_id?: string | null
          user_id: string
        }
        Update: {
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          priority?: number | null
          user_google_calendar_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_calendar_members_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "crm_calendars"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_calendars: {
        Row: {
          buffer_after: number | null
          buffer_before: number | null
          calendar_type: string | null
          calendly_connection_id: string | null
          calendly_user_uri: string | null
          calendly_webhook_id: string | null
          created_at: string | null
          date_range_days: number | null
          description: string | null
          google_calendar_id: string | null
          google_refresh_token: string | null
          host_notify_on_booking: boolean | null
          id: string
          is_active: boolean | null
          max_bookings_per_day: number | null
          max_participants: number | null
          meeting_location_type: string | null
          meeting_location_value: string | null
          metadata: Json | null
          min_notice_hours: number | null
          name: string
          owner_user_id: string | null
          slot_duration: number | null
          slot_interval: number | null
          slug: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          buffer_after?: number | null
          buffer_before?: number | null
          calendar_type?: string | null
          calendly_connection_id?: string | null
          calendly_user_uri?: string | null
          calendly_webhook_id?: string | null
          created_at?: string | null
          date_range_days?: number | null
          description?: string | null
          google_calendar_id?: string | null
          google_refresh_token?: string | null
          host_notify_on_booking?: boolean | null
          id?: string
          is_active?: boolean | null
          max_bookings_per_day?: number | null
          max_participants?: number | null
          meeting_location_type?: string | null
          meeting_location_value?: string | null
          metadata?: Json | null
          min_notice_hours?: number | null
          name?: string
          owner_user_id?: string | null
          slot_duration?: number | null
          slot_interval?: number | null
          slug?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          buffer_after?: number | null
          buffer_before?: number | null
          calendar_type?: string | null
          calendly_connection_id?: string | null
          calendly_user_uri?: string | null
          calendly_webhook_id?: string | null
          created_at?: string | null
          date_range_days?: number | null
          description?: string | null
          google_calendar_id?: string | null
          google_refresh_token?: string | null
          host_notify_on_booking?: boolean | null
          id?: string
          is_active?: boolean | null
          max_bookings_per_day?: number | null
          max_participants?: number | null
          meeting_location_type?: string | null
          meeting_location_value?: string | null
          metadata?: Json | null
          min_notice_hours?: number | null
          name?: string
          owner_user_id?: string | null
          slot_duration?: number | null
          slot_interval?: number | null
          slug?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_calendars_calendly_connection_id_fkey"
            columns: ["calendly_connection_id"]
            isOneToOne: false
            referencedRelation: "crm_calendly_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_calendly_connections: {
        Row: {
          calendly_org_uri: string | null
          calendly_user_email: string | null
          calendly_user_name: string | null
          calendly_user_uri: string
          created_at: string | null
          encrypted_access_token: string
          id: string
          signing_key: string
          updated_at: string | null
          user_id: string
          webhook_id: string | null
        }
        Insert: {
          calendly_org_uri?: string | null
          calendly_user_email?: string | null
          calendly_user_name?: string | null
          calendly_user_uri: string
          created_at?: string | null
          encrypted_access_token: string
          id?: string
          signing_key: string
          updated_at?: string | null
          user_id: string
          webhook_id?: string | null
        }
        Update: {
          calendly_org_uri?: string | null
          calendly_user_email?: string | null
          calendly_user_name?: string | null
          calendly_user_uri?: string
          created_at?: string | null
          encrypted_access_token?: string
          id?: string
          signing_key?: string
          updated_at?: string | null
          user_id?: string
          webhook_id?: string | null
        }
        Relationships: []
      }
      crm_campaigns: {
        Row: {
          channel: string
          created_at: string | null
          filter_query: Json | null
          html_body: string | null
          id: string
          images: Json | null
          list_id: string | null
          list_ids: Json | null
          name: string
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          style_preset: string | null
          subject: string | null
          text_body: string | null
          total_clicked: number | null
          total_opened: number | null
          total_recipients: number | null
          total_sent: number | null
        }
        Insert: {
          channel?: string
          created_at?: string | null
          filter_query?: Json | null
          html_body?: string | null
          id?: string
          images?: Json | null
          list_id?: string | null
          list_ids?: Json | null
          name: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          style_preset?: string | null
          subject?: string | null
          text_body?: string | null
          total_clicked?: number | null
          total_opened?: number | null
          total_recipients?: number | null
          total_sent?: number | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          filter_query?: Json | null
          html_body?: string | null
          id?: string
          images?: Json | null
          list_id?: string | null
          list_ids?: Json | null
          name?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          style_preset?: string | null
          subject?: string | null
          text_body?: string | null
          total_clicked?: number | null
          total_opened?: number | null
          total_recipients?: number | null
          total_sent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_campaigns_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "crm_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contact_lists: {
        Row: {
          contact_id: string
          created_at: string | null
          id: string
          list_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          id?: string
          list_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          id?: string
          list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_contact_lists_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contact_lists_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "crm_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          address: Json | null
          created_at: string | null
          ecom_customer_id: string | null
          email: string
          id: string
          last_order_at: string | null
          metadata: Json | null
          name: string | null
          phone: string | null
          sms_opt_in: boolean | null
          source: string | null
          subscribed: boolean | null
          subscribed_at: string | null
          tags: string[] | null
          total_orders: number | null
          total_spent: number | null
          unsubscribed_at: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          ecom_customer_id?: string | null
          email: string
          id?: string
          last_order_at?: string | null
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          sms_opt_in?: boolean | null
          source?: string | null
          subscribed?: boolean | null
          subscribed_at?: string | null
          tags?: string[] | null
          total_orders?: number | null
          total_spent?: number | null
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          ecom_customer_id?: string | null
          email?: string
          id?: string
          last_order_at?: string | null
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          sms_opt_in?: boolean | null
          source?: string | null
          subscribed?: boolean | null
          subscribed_at?: string | null
          tags?: string[] | null
          total_orders?: number | null
          total_spent?: number | null
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      crm_events: {
        Row: {
          campaign_id: string | null
          channel: string
          contact_id: string | null
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          campaign_id?: string | null
          channel?: string
          contact_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          campaign_id?: string | null
          channel?: string
          contact_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "crm_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_flow_logs: {
        Row: {
          contact_id: string | null
          created_at: string | null
          flow_id: string | null
          id: string
          metadata: Json | null
          status: string | null
          step_id: string | null
          trigger_event: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          flow_id?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          step_id?: string | null
          trigger_event: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          flow_id?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          step_id?: string | null
          trigger_event?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_flow_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_flow_logs_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "crm_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_flow_logs_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "crm_flow_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_flow_step_queue: {
        Row: {
          attempts: number
          contact_id: string
          created_at: string
          event_data: Json
          finished_at: string | null
          flow_id: string
          id: string
          last_error: string | null
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          resume_step_order: number
          run_at: string
        }
        Insert: {
          attempts?: number
          contact_id: string
          created_at?: string
          event_data?: Json
          finished_at?: string | null
          flow_id: string
          id?: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          resume_step_order: number
          run_at: string
        }
        Update: {
          attempts?: number
          contact_id?: string
          created_at?: string
          event_data?: Json
          finished_at?: string | null
          flow_id?: string
          id?: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          resume_step_order?: number
          run_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_flow_step_queue_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_flow_step_queue_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "crm_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_flow_steps: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string | null
          flow_id: string | null
          id: string
          step_order: number
        }
        Insert: {
          action_config?: Json
          action_type: string
          created_at?: string | null
          flow_id?: string | null
          id?: string
          step_order: number
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string | null
          flow_id?: string | null
          id?: string
          step_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_flow_steps_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "crm_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_flows: {
        Row: {
          created_at: string | null
          cron_job_name: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_config: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cron_job_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cron_job_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      crm_lists: {
        Row: {
          created_at: string | null
          description: string | null
          filter_query: Json | null
          id: string
          is_dynamic: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          filter_query?: Json | null
          id?: string
          is_dynamic?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          filter_query?: Json | null
          id?: string
          is_dynamic?: boolean | null
          name?: string
        }
        Relationships: []
      }
      digital_verifications: {
        Row: {
          asset_id: string
          asset_type: string
          blockchain_tx: string
          created_at: string | null
          cryptographic_hash: string
          dv_code: string
          id: string
          ipfs_hash: string
          metadata: Json | null
          status: string | null
          verified_at: string | null
        }
        Insert: {
          asset_id: string
          asset_type: string
          blockchain_tx: string
          created_at?: string | null
          cryptographic_hash: string
          dv_code: string
          id?: string
          ipfs_hash: string
          metadata?: Json | null
          status?: string | null
          verified_at?: string | null
        }
        Update: {
          asset_id?: string
          asset_type?: string
          blockchain_tx?: string
          created_at?: string | null
          cryptographic_hash?: string
          dv_code?: string
          id?: string
          ipfs_hash?: string
          metadata?: Json | null
          status?: string | null
          verified_at?: string | null
        }
        Relationships: []
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
      encounters: {
        Row: {
          created_at: string
          id: string
          recording_path: string | null
          room_id: string
          soap_note: string | null
          summary_sent_at: string | null
          transcript: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          recording_path?: string | null
          room_id: string
          soap_note?: string | null
          summary_sent_at?: string | null
          transcript?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          recording_path?: string | null
          room_id?: string
          soap_note?: string | null
          summary_sent_at?: string | null
          transcript?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "encounters_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          corrective_action: string | null
          created_at: string | null
          description: string | null
          error_type: string | null
          id: number
          impact: string | null
          resolved_at: string | null
          source_ai: string | null
          status: string | null
        }
        Insert: {
          corrective_action?: string | null
          created_at?: string | null
          description?: string | null
          error_type?: string | null
          id?: number
          impact?: string | null
          resolved_at?: string | null
          source_ai?: string | null
          status?: string | null
        }
        Update: {
          corrective_action?: string | null
          created_at?: string | null
          description?: string | null
          error_type?: string | null
          id?: number
          impact?: string | null
          resolved_at?: string | null
          source_ai?: string | null
          status?: string | null
        }
        Relationships: []
      }
      global_research_nodes: {
        Row: {
          created_at: string | null
          id: string
          name: string
          node_code: string
          rating: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          node_code: string
          rating?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          node_code?: string
          rating?: number | null
          status?: string | null
        }
        Relationships: []
      }
      health_records: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          notes: string | null
          patient_id: string | null
          record_type: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          record_type?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          record_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hubs: {
        Row: {
          description: string | null
          id: string
          lat: number
          lng: number
          name: string
        }
        Insert: {
          description?: string | null
          id: string
          lat: number
          lng: number
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          lat?: number
          lng?: number
          name?: string
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
      knowledge_entries: {
        Row: {
          category: string
          confidence_score: number | null
          content: string
          created_at: string | null
          id: number
          meta_data: string | null
          source: string | null
          tags: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          confidence_score?: number | null
          content: string
          created_at?: string | null
          id?: number
          meta_data?: string | null
          source?: string | null
          tags?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          confidence_score?: number | null
          content?: string
          created_at?: string | null
          id?: number
          meta_data?: string | null
          source?: string | null
          tags?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lab_audited_assets: {
        Row: {
          asset_name: string
          calibration_due: string | null
          category: string
          compliance_tag: string | null
          facility: string
          id: string
          installation_date: string | null
          manufacturer: string | null
          model: string | null
          serial_number: string | null
          status: string
        }
        Insert: {
          asset_name: string
          calibration_due?: string | null
          category: string
          compliance_tag?: string | null
          facility: string
          id?: string
          installation_date?: string | null
          manufacturer?: string | null
          model?: string | null
          serial_number?: string | null
          status?: string
        }
        Update: {
          asset_name?: string
          calibration_due?: string | null
          category?: string
          compliance_tag?: string | null
          facility?: string
          id?: string
          installation_date?: string | null
          manufacturer?: string | null
          model?: string | null
          serial_number?: string | null
          status?: string
        }
        Relationships: []
      }
      lab_registry: {
        Row: {
          api_base_url: string
          auth_type: string
          created_at: string
          encrypted_credentials_ref: string | null
          is_active: boolean | null
          lab_id: string
          last_sync: string | null
          name: string
          type: string
        }
        Insert: {
          api_base_url: string
          auth_type: string
          created_at?: string
          encrypted_credentials_ref?: string | null
          is_active?: boolean | null
          lab_id: string
          last_sync?: string | null
          name: string
          type: string
        }
        Update: {
          api_base_url?: string
          auth_type?: string
          created_at?: string
          encrypted_credentials_ref?: string | null
          is_active?: boolean | null
          lab_id?: string
          last_sync?: string | null
          name?: string
          type?: string
        }
        Relationships: []
      }
      laboratory_telemetry_logs: {
        Row: {
          active_throughput: number
          average_tat_hours: number | null
          capacity_utilization: number | null
          critical_alerts_count: number | null
          facility: string
          id: number
          recorded_at: string | null
          room_id: string
        }
        Insert: {
          active_throughput: number
          average_tat_hours?: number | null
          capacity_utilization?: number | null
          critical_alerts_count?: number | null
          facility: string
          id?: number
          recorded_at?: string | null
          room_id: string
        }
        Update: {
          active_throughput?: number
          average_tat_hours?: number | null
          capacity_utilization?: number | null
          critical_alerts_count?: number | null
          facility?: string
          id?: number
          recorded_at?: string | null
          room_id?: string
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
      message_chains: {
        Row: {
          chain_order: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          source_platform_id: string | null
          source_type: string
          target_platform_id: string | null
          trigger_condition: string | null
          workspace_id: string | null
        }
        Insert: {
          chain_order?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          source_platform_id?: string | null
          source_type: string
          target_platform_id?: string | null
          trigger_condition?: string | null
          workspace_id?: string | null
        }
        Update: {
          chain_order?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          source_platform_id?: string | null
          source_type?: string
          target_platform_id?: string | null
          trigger_condition?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_chains_source_platform_id_fkey"
            columns: ["source_platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_chains_target_platform_id_fkey"
            columns: ["target_platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_chains_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          author_id: string | null
          author_type: string | null
          chain_id: string | null
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          is_chained: boolean | null
          metadata: Json | null
          source_platform_id: string | null
          type: string
        }
        Insert: {
          author_id?: string | null
          author_type?: string | null
          chain_id?: string | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_chained?: boolean | null
          metadata?: Json | null
          source_platform_id?: string | null
          type: string
        }
        Update: {
          author_id?: string | null
          author_type?: string | null
          chain_id?: string | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_chained?: boolean | null
          metadata?: Json | null
          source_platform_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "message_chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_source_platform_id_fkey"
            columns: ["source_platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      multimedia_stream: {
        Row: {
          active: boolean | null
          audio_url: string | null
          broadcast_at: string | null
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          host: string | null
          hub_id: string | null
          id: string
          is_live: boolean | null
          listener_count: number | null
          metadata: Json | null
          pillar_id: string | null
          segments: Json | null
          show_type: string | null
          status: string | null
          stream_url: string | null
          tags: string[] | null
          title: string
          transcript: string | null
          type: string | null
        }
        Insert: {
          active?: boolean | null
          audio_url?: string | null
          broadcast_at?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          host?: string | null
          hub_id?: string | null
          id?: string
          is_live?: boolean | null
          listener_count?: number | null
          metadata?: Json | null
          pillar_id?: string | null
          segments?: Json | null
          show_type?: string | null
          status?: string | null
          stream_url?: string | null
          tags?: string[] | null
          title: string
          transcript?: string | null
          type?: string | null
        }
        Update: {
          active?: boolean | null
          audio_url?: string | null
          broadcast_at?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          host?: string | null
          hub_id?: string | null
          id?: string
          is_live?: boolean | null
          listener_count?: number | null
          metadata?: Json | null
          pillar_id?: string | null
          segments?: Json | null
          show_type?: string | null
          status?: string | null
          stream_url?: string | null
          tags?: string[] | null
          title?: string
          transcript?: string | null
          type?: string | null
        }
        Relationships: []
      }
      neural_agents: {
        Row: {
          agent_name: string
          created_at: string | null
          health_score: number | null
          id: string
          last_activated_at: string | null
          last_used_at: string | null
          max_requests_per_day: number | null
          mistral_api_key: string
          notes: string | null
          org_name: string | null
          pillar_assignment: string | null
          platform_home: string | null
          requests_today: number | null
          soul_number: number | null
          specialization: string | null
          status: string | null
          total_requests: number | null
        }
        Insert: {
          agent_name: string
          created_at?: string | null
          health_score?: number | null
          id?: string
          last_activated_at?: string | null
          last_used_at?: string | null
          max_requests_per_day?: number | null
          mistral_api_key: string
          notes?: string | null
          org_name?: string | null
          pillar_assignment?: string | null
          platform_home?: string | null
          requests_today?: number | null
          soul_number?: number | null
          specialization?: string | null
          status?: string | null
          total_requests?: number | null
        }
        Update: {
          agent_name?: string
          created_at?: string | null
          health_score?: number | null
          id?: string
          last_activated_at?: string | null
          last_used_at?: string | null
          max_requests_per_day?: number | null
          mistral_api_key?: string
          notes?: string | null
          org_name?: string | null
          pillar_assignment?: string | null
          platform_home?: string | null
          requests_today?: number | null
          soul_number?: number | null
          specialization?: string | null
          status?: string | null
          total_requests?: number | null
        }
        Relationships: []
      }
      omnicog_memory: {
        Row: {
          ai_insights: string[] | null
          content: Json | null
          context_key: string
          coordinates: Json | null
          created_at: string | null
          discovery_type: string | null
          id: string
          impact_score: number | null
          intelligence_level: number | null
          intensity: number | null
          is_moonshot: boolean | null
          last_accessed: string | null
          memory_data: Json
          metrics: Json | null
          phase: string | null
          pillar_id: string | null
          source_agent: string | null
          summary: string | null
          title: string
          updated_at: string | null
          visual_color: string | null
          visual_motif: string | null
        }
        Insert: {
          ai_insights?: string[] | null
          content?: Json | null
          context_key: string
          coordinates?: Json | null
          created_at?: string | null
          discovery_type?: string | null
          id?: string
          impact_score?: number | null
          intelligence_level?: number | null
          intensity?: number | null
          is_moonshot?: boolean | null
          last_accessed?: string | null
          memory_data: Json
          metrics?: Json | null
          phase?: string | null
          pillar_id?: string | null
          source_agent?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
          visual_color?: string | null
          visual_motif?: string | null
        }
        Update: {
          ai_insights?: string[] | null
          content?: Json | null
          context_key?: string
          coordinates?: Json | null
          created_at?: string | null
          discovery_type?: string | null
          id?: string
          impact_score?: number | null
          intelligence_level?: number | null
          intensity?: number | null
          is_moonshot?: boolean | null
          last_accessed?: string | null
          memory_data?: Json
          metrics?: Json | null
          phase?: string | null
          pillar_id?: string | null
          source_agent?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
          visual_color?: string | null
          visual_motif?: string | null
        }
        Relationships: []
      }
      platform_responses: {
        Row: {
          content: string | null
          created_at: string | null
          error: string | null
          id: string
          message_id: string | null
          platform_id: string | null
          response_time: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          message_id?: string | null
          platform_id?: string | null
          response_time?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          message_id?: string | null
          platform_id?: string | null
          response_time?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_responses_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_responses_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      platforms: {
        Row: {
          api_key: string | null
          config: Json | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          name: string
          status: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          api_key?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          name: string
          status?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          api_key?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          name?: string
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platforms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_handshakes: {
        Row: {
          completed_at: string | null
          created_at: string | null
          dependencies: string[] | null
          description: string | null
          handshake_name: string | null
          id: string
          lead_agent: string | null
          notes: string | null
          output_artifact: string | null
          priority: number | null
          progress_pct: number | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          handshake_name?: string | null
          id?: string
          lead_agent?: string | null
          notes?: string | null
          output_artifact?: string | null
          priority?: number | null
          progress_pct?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          handshake_name?: string | null
          id?: string
          lead_agent?: string | null
          notes?: string | null
          output_artifact?: string | null
          priority?: number | null
          progress_pct?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pmo_members: {
        Row: {
          avatar_initials: string | null
          country: string
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          role: string
        }
        Insert: {
          avatar_initials?: string | null
          country?: string
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          role: string
        }
        Update: {
          avatar_initials?: string | null
          country?: string
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      pmo_milestones: {
        Row: {
          country: string
          description: string | null
          id: string
          phase: string
          status: string
          target_date: string
          title: string
        }
        Insert: {
          country: string
          description?: string | null
          id?: string
          phase: string
          status?: string
          target_date: string
          title: string
        }
        Update: {
          country?: string
          description?: string | null
          id?: string
          phase?: string
          status?: string
          target_date?: string
          title?: string
        }
        Relationships: []
      }
      pmo_projections: {
        Row: {
          country: string | null
          created_at: string
          ebitda_margin: number | null
          ebitda_target: number | null
          id: string
          revenue_target: number | null
          tests_processed: number | null
          year_number: number | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          ebitda_margin?: number | null
          ebitda_target?: number | null
          id?: string
          revenue_target?: number | null
          tests_processed?: number | null
          year_number?: number | null
        }
        Update: {
          country?: string | null
          created_at?: string
          ebitda_margin?: number | null
          ebitda_target?: number | null
          id?: string
          revenue_target?: number | null
          tests_processed?: number | null
          year_number?: number | null
        }
        Relationships: []
      }
      pmo_sync_records: {
        Row: {
          author_email: string
          checksum: string | null
          created_at: string | null
          description: string | null
          id: string
          payload: Json
          sender_id: string | null
          source_type: string | null
        }
        Insert: {
          author_email: string
          checksum?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          payload: Json
          sender_id?: string | null
          source_type?: string | null
        }
        Update: {
          author_email?: string
          checksum?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          payload?: Json
          sender_id?: string | null
          source_type?: string | null
        }
        Relationships: []
      }
      pmo_tasks: {
        Row: {
          assigned_to: string | null
          country: string
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          kpi_metrics: string[] | null
          phase: string
          progress: number | null
          sector: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          country: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          kpi_metrics?: string[] | null
          phase: string
          progress?: number | null
          sector: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          country?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          kpi_metrics?: string[] | null
          phase?: string
          progress?: number | null
          sector?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pmo_test_clusters: {
        Row: {
          cluster_id: string
          created_at: string
          ksa_base_volume: number | null
          ksa_revenue_potential: number | null
          name: string
          test_count: number | null
        }
        Insert: {
          cluster_id: string
          created_at?: string
          ksa_base_volume?: number | null
          ksa_revenue_potential?: number | null
          name: string
          test_count?: number | null
        }
        Update: {
          cluster_id?: string
          created_at?: string
          ksa_base_volume?: number | null
          ksa_revenue_potential?: number | null
          name?: string
          test_count?: number | null
        }
        Relationships: []
      }
      pmo_vendors: {
        Row: {
          category: string | null
          contact_person: string | null
          created_at: string
          name: string
          status: string | null
          tier: number | null
          vendor_id: string
        }
        Insert: {
          category?: string | null
          contact_person?: string | null
          created_at?: string
          name: string
          status?: string | null
          tier?: number | null
          vendor_id: string
        }
        Update: {
          category?: string | null
          contact_person?: string | null
          created_at?: string
          name?: string
          status?: string | null
          tier?: number | null
          vendor_id?: string
        }
        Relationships: []
      }
      procedural_memory: {
        Row: {
          conditions: string | null
          created_at: string | null
          description: string
          id: number
          last_used: string | null
          optimization_notes: string | null
          skill_name: string
          steps: string
          success_rate: number | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          conditions?: string | null
          created_at?: string | null
          description: string
          id?: number
          last_used?: string | null
          optimization_notes?: string | null
          skill_name: string
          steps: string
          success_rate?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          conditions?: string | null
          created_at?: string | null
          description?: string
          id?: number
          last_used?: string | null
          optimization_notes?: string | null
          skill_name?: string
          steps?: string
          success_rate?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      profile_auth_binding_tokens: {
        Row: {
          consumed_at: string | null
          consumed_by_auth_user_id: string | null
          expires_at: string
          issued_at: string
          normalized_email: string
          profile_id: string
          token_hash: string
        }
        Insert: {
          consumed_at?: string | null
          consumed_by_auth_user_id?: string | null
          expires_at: string
          issued_at?: string
          normalized_email: string
          profile_id: string
          token_hash: string
        }
        Update: {
          consumed_at?: string | null
          consumed_by_auth_user_id?: string | null
          expires_at?: string
          issued_at?: string
          normalized_email?: string
          profile_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_auth_binding_tokens_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_auth_identities: {
        Row: {
          auth_user_id: string
          bound_at: string
          created_at: string
          normalized_email: string
          profile_id: string
        }
        Insert: {
          auth_user_id: string
          bound_at?: string
          created_at?: string
          normalized_email: string
          profile_id: string
        }
        Update: {
          auth_user_id?: string
          bound_at?: string
          created_at?: string
          normalized_email?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_auth_identities_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_role_audit: {
        Row: {
          actor_profile_id: string
          approved_role: string
          created_at: string
          id: string
          previous_role: string
          reason: string
          target_profile_id: string
        }
        Insert: {
          actor_profile_id: string
          approved_role: string
          created_at?: string
          id?: string
          previous_role: string
          reason: string
          target_profile_id: string
        }
        Update: {
          actor_profile_id?: string
          approved_role?: string
          created_at?: string
          id?: string
          previous_role?: string
          reason?: string
          target_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_role_audit_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_role_audit_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          phone: string | null
          preferred_language: string | null
          requested_role: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          requested_role?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          requested_role?: string | null
          role?: string | null
          updated_at?: string
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
      ptd_patient_assessments: {
        Row: {
          patient_id: string
          ptd_assessment_date: string | null
          ptd_assessment_id: string
          ptd_clinic_branch: string
          ptd_created_at: string
          ptd_daily_activities_impact: Json | null
          ptd_file_no: string | null
          ptd_has_bladder_bowel_loss: boolean | null
          ptd_has_cancer_fracture_history: boolean | null
          ptd_has_unexplained_weight_loss: boolean | null
          ptd_history_details: string | null
          ptd_history_previous_injury: boolean | null
          ptd_onset_how: string | null
          ptd_onset_when: string | null
          ptd_pain_description: string[] | null
          ptd_pain_intensity_vas: number | null
          ptd_pain_locations: Json | null
          ptd_pain_relievers: string[] | null
          ptd_pain_triggers: string[] | null
          ptd_patient_lifestyle_demographics: Json | null
          ptd_patient_name: string
          ptd_physical_effort_level: string | null
          ptd_reason_for_visit: string[] | null
          ptd_sleep_quality: string | null
          ptd_submitted_offline: boolean | null
          ptd_takes_blood_thinners: boolean | null
          ptd_treatment_goals: string[] | null
          ptd_water_intake: string | null
        }
        Insert: {
          patient_id: string
          ptd_assessment_date?: string | null
          ptd_assessment_id?: string
          ptd_clinic_branch: string
          ptd_created_at?: string
          ptd_daily_activities_impact?: Json | null
          ptd_file_no?: string | null
          ptd_has_bladder_bowel_loss?: boolean | null
          ptd_has_cancer_fracture_history?: boolean | null
          ptd_has_unexplained_weight_loss?: boolean | null
          ptd_history_details?: string | null
          ptd_history_previous_injury?: boolean | null
          ptd_onset_how?: string | null
          ptd_onset_when?: string | null
          ptd_pain_description?: string[] | null
          ptd_pain_intensity_vas?: number | null
          ptd_pain_locations?: Json | null
          ptd_pain_relievers?: string[] | null
          ptd_pain_triggers?: string[] | null
          ptd_patient_lifestyle_demographics?: Json | null
          ptd_patient_name: string
          ptd_physical_effort_level?: string | null
          ptd_reason_for_visit?: string[] | null
          ptd_sleep_quality?: string | null
          ptd_submitted_offline?: boolean | null
          ptd_takes_blood_thinners?: boolean | null
          ptd_treatment_goals?: string[] | null
          ptd_water_intake?: string | null
        }
        Update: {
          patient_id?: string
          ptd_assessment_date?: string | null
          ptd_assessment_id?: string
          ptd_clinic_branch?: string
          ptd_created_at?: string
          ptd_daily_activities_impact?: Json | null
          ptd_file_no?: string | null
          ptd_has_bladder_bowel_loss?: boolean | null
          ptd_has_cancer_fracture_history?: boolean | null
          ptd_has_unexplained_weight_loss?: boolean | null
          ptd_history_details?: string | null
          ptd_history_previous_injury?: boolean | null
          ptd_onset_how?: string | null
          ptd_onset_when?: string | null
          ptd_pain_description?: string[] | null
          ptd_pain_intensity_vas?: number | null
          ptd_pain_locations?: Json | null
          ptd_pain_relievers?: string[] | null
          ptd_pain_triggers?: string[] | null
          ptd_patient_lifestyle_demographics?: Json | null
          ptd_patient_name?: string
          ptd_physical_effort_level?: string | null
          ptd_reason_for_visit?: string[] | null
          ptd_sleep_quality?: string | null
          ptd_submitted_offline?: boolean | null
          ptd_takes_blood_thinners?: boolean | null
          ptd_treatment_goals?: string[] | null
          ptd_water_intake?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ptd_patient_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          abstract: string | null
          access_level: string | null
          authors: string | null
          created_at: string | null
          doi: string | null
          id: string
          is_verified: boolean | null
          pillar: string | null
          source: string | null
          tags: string[] | null
          title: string
          url: string | null
          year: number | null
        }
        Insert: {
          abstract?: string | null
          access_level?: string | null
          authors?: string | null
          created_at?: string | null
          doi?: string | null
          id?: string
          is_verified?: boolean | null
          pillar?: string | null
          source?: string | null
          tags?: string[] | null
          title: string
          url?: string | null
          year?: number | null
        }
        Update: {
          abstract?: string | null
          access_level?: string | null
          authors?: string | null
          created_at?: string | null
          doi?: string | null
          id?: string
          is_verified?: boolean | null
          pillar?: string | null
          source?: string | null
          tags?: string[] | null
          title?: string
          url?: string | null
          year?: number | null
        }
        Relationships: []
      }
      regional_kpi_metrics: {
        Row: {
          country: string
          current_value: number
          id: string
          metric_name: string
          sector: string
          target_value: number
          trend_state: string | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          country: string
          current_value: number
          id?: string
          metric_name: string
          sector: string
          target_value: number
          trend_state?: string | null
          unit: string
          updated_at?: string | null
        }
        Update: {
          country?: string
          current_value?: number
          id?: string
          metric_name?: string
          sector?: string
          target_value?: number
          trend_state?: string | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      research_outputs: {
        Row: {
          analysis: string
          created_at: string | null
          id: string
          impact_score: number | null
          is_moonshot: boolean | null
          model_used: string | null
          omnicog_memory_id: string | null
          pillar: string | null
          publications_used: string[] | null
          query: string
          tags: string[] | null
          title: string | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          analysis: string
          created_at?: string | null
          id?: string
          impact_score?: number | null
          is_moonshot?: boolean | null
          model_used?: string | null
          omnicog_memory_id?: string | null
          pillar?: string | null
          publications_used?: string[] | null
          query: string
          tags?: string[] | null
          title?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          analysis?: string
          created_at?: string | null
          id?: string
          impact_score?: number | null
          is_moonshot?: boolean | null
          model_used?: string | null
          omnicog_memory_id?: string | null
          pillar?: string | null
          publications_used?: string[] | null
          query?: string
          tags?: string[] | null
          title?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_outputs_omnicog_memory_id_fkey"
            columns: ["omnicog_memory_id"]
            isOneToOne: false
            referencedRelation: "omnicog_memory"
            referencedColumns: ["id"]
          },
        ]
      }
      response_metrics: {
        Row: {
          id: string
          message_id: string | null
          platform_id: string | null
          response_time: number
          status: string
          timestamp: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          id?: string
          message_id?: string | null
          platform_id?: string | null
          response_time: number
          status: string
          timestamp?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          id?: string
          message_id?: string | null
          platform_id?: string | null
          response_time?: number
          status?: string
          timestamp?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "response_metrics_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_metrics_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_metrics_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      response_time_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          notification_methods: Json
          platform_id: string | null
          threshold_ms: number
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notification_methods: Json
          platform_id?: string | null
          threshold_ms: number
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notification_methods?: Json
          platform_id?: string | null
          threshold_ms?: number
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "response_time_notifications_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_time_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_time_notifications_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          ai_deputy_active: boolean
          clinician_session: string | null
          created_at: string
          created_by_session: string
          ended_at: string | null
          id: string
          language: string | null
          patient_session: string | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ai_deputy_active?: boolean
          clinician_session?: string | null
          created_at?: string
          created_by_session: string
          ended_at?: string | null
          id: string
          language?: string | null
          patient_session?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ai_deputy_active?: boolean
          clinician_session?: string | null
          created_at?: string
          created_by_session?: string
          ended_at?: string | null
          id?: string
          language?: string | null
          patient_session?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_tasks: {
        Row: {
          created_at: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed: string | null
          max_executions: number | null
          message_content: string
          name: string
          next_execution: string | null
          schedule_type: string
          schedule_value: string
          target_platforms: Json
          timezone: string | null
          updated_at: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed?: string | null
          max_executions?: number | null
          message_content: string
          name: string
          next_execution?: string | null
          schedule_type: string
          schedule_value: string
          target_platforms: Json
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed?: string | null
          max_executions?: number | null
          message_content?: string
          name?: string
          next_execution?: string | null
          schedule_type?: string
          schedule_value?: string
          target_platforms?: Json
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      short_term_memory: {
        Row: {
          access_count: number | null
          content: string
          context_type: string
          created_at: string | null
          expires_at: string | null
          id: number
          last_accessed: string | null
          meta_data: string | null
          priority: number | null
          session_id: string
        }
        Insert: {
          access_count?: number | null
          content: string
          context_type: string
          created_at?: string | null
          expires_at?: string | null
          id?: number
          last_accessed?: string | null
          meta_data?: string | null
          priority?: number | null
          session_id: string
        }
        Update: {
          access_count?: number | null
          content?: string
          context_type?: string
          created_at?: string | null
          expires_at?: string | null
          id?: number
          last_accessed?: string | null
          meta_data?: string | null
          priority?: number | null
          session_id?: string
        }
        Relationships: []
      }
      studio_projects: {
        Row: {
          created_at: string | null
          duration: number | null
          id: string
          name: string
          owner_id: string | null
          tracks: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          id?: string
          name: string
          owner_id?: string | null
          tracks?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          id?: string
          name?: string
          owner_id?: string | null
          tracks?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      syndicate_board_meetings: {
        Row: {
          clinical_summary: string | null
          communication_platform: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          key_outcomes_list: string[] | null
          linked_task_id: string | null
          meeting_date: string
          recording_file_url: string | null
          title: string
        }
        Insert: {
          clinical_summary?: string | null
          communication_platform?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          key_outcomes_list?: string[] | null
          linked_task_id?: string | null
          meeting_date: string
          recording_file_url?: string | null
          title: string
        }
        Update: {
          clinical_summary?: string | null
          communication_platform?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          key_outcomes_list?: string[] | null
          linked_task_id?: string | null
          meeting_date?: string
          recording_file_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "syndicate_board_meetings_linked_task_id_fkey"
            columns: ["linked_task_id"]
            isOneToOne: false
            referencedRelation: "pmo_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_checklist_items: {
        Row: {
          completed_at: string | null
          id: string
          is_completed: boolean | null
          sort_order: number | null
          task_id: string
          text: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          sort_order?: number | null
          task_id: string
          text: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          sort_order?: number | null
          task_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_checklist_items_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "pmo_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_checklists: {
        Row: {
          completed: boolean | null
          id: string
          sort_order: number | null
          task_id: string
          text: string
        }
        Insert: {
          completed?: boolean | null
          id?: string
          sort_order?: number | null
          task_id: string
          text: string
        }
        Update: {
          completed?: boolean | null
          id?: string
          sort_order?: number | null
          task_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_checklists_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "pmo_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_executions: {
        Row: {
          average_response_time: number | null
          conversation_id: string | null
          created_at: string | null
          end_time: string | null
          errors: Json | null
          id: string
          response_count: number | null
          results: Json | null
          start_time: string | null
          status: string
          task_id: string | null
        }
        Insert: {
          average_response_time?: number | null
          conversation_id?: string | null
          created_at?: string | null
          end_time?: string | null
          errors?: Json | null
          id?: string
          response_count?: number | null
          results?: Json | null
          start_time?: string | null
          status: string
          task_id?: string | null
        }
        Update: {
          average_response_time?: number | null
          conversation_id?: string | null
          created_at?: string | null
          end_time?: string | null
          errors?: Json | null
          id?: string
          response_count?: number | null
          results?: Json | null
          start_time?: string | null
          status?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_executions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_executions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "scheduled_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_history_logs: {
        Row: {
          changed_by: string
          comment: string | null
          from_status: string
          id: string
          task_id: string
          timestamp: string | null
          to_status: string
        }
        Insert: {
          changed_by: string
          comment?: string | null
          from_status: string
          id?: string
          task_id: string
          timestamp?: string | null
          to_status: string
        }
        Update: {
          changed_by?: string
          comment?: string | null
          from_status?: string
          id?: string
          task_id?: string
          timestamp?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_history_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "pmo_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_memory: {
        Row: {
          context_key: string
          created_at: string | null
          id: string
          last_accessed: string | null
          memory_data: Json
        }
        Insert: {
          context_key: string
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          memory_data: Json
        }
        Update: {
          context_key?: string
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          memory_data?: Json
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      vitals_readings: {
        Row: {
          bmi_estimate: number | null
          bp_diastolic: number | null
          bp_systolic: number | null
          captured_at: string
          confidence: number | null
          created_at: string
          facial_age_estimate: number | null
          heart_rate_bpm: number | null
          hemoglobin_estimate: number | null
          hrv_sdnn_ms: number | null
          id: string
          raw_payload: Json | null
          resp_rate_bpm: number | null
          room_id: string | null
          session_id: string
          skin_tone_ita: number | null
          source: string
          spo2_pct: number | null
          stress_index: number | null
          wrinkle_score: number | null
        }
        Insert: {
          bmi_estimate?: number | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          captured_at?: string
          confidence?: number | null
          created_at?: string
          facial_age_estimate?: number | null
          heart_rate_bpm?: number | null
          hemoglobin_estimate?: number | null
          hrv_sdnn_ms?: number | null
          id?: string
          raw_payload?: Json | null
          resp_rate_bpm?: number | null
          room_id?: string | null
          session_id: string
          skin_tone_ita?: number | null
          source?: string
          spo2_pct?: number | null
          stress_index?: number | null
          wrinkle_score?: number | null
        }
        Update: {
          bmi_estimate?: number | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          captured_at?: string
          confidence?: number | null
          created_at?: string
          facial_age_estimate?: number | null
          heart_rate_bpm?: number | null
          hemoglobin_estimate?: number | null
          hrv_sdnn_ms?: number | null
          id?: string
          raw_payload?: Json | null
          resp_rate_bpm?: number | null
          room_id?: string | null
          session_id?: string
          skin_tone_ita?: number | null
          source?: string
          spo2_pct?: number | null
          stress_index?: number | null
          wrinkle_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vitals_readings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_dispatch_history: {
        Row: {
          attachment_name: string | null
          attachment_storage_url: string | null
          avatar_initials: string
          created_at: string | null
          id: string
          is_system_parsed: boolean | null
          message_text: string
          role: string
          sender_name: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_storage_url?: string | null
          avatar_initials: string
          created_at?: string | null
          id?: string
          is_system_parsed?: boolean | null
          message_text: string
          role: string
          sender_name: string
        }
        Update: {
          attachment_name?: string | null
          attachment_storage_url?: string | null
          avatar_initials?: string
          created_at?: string | null
          id?: string
          is_system_parsed?: boolean | null
          message_text?: string
          role?: string
          sender_name?: string
        }
        Relationships: []
      }
      whatsapp_syndicate_dispatches: {
        Row: {
          attachment_filename: string | null
          avatar_letters: string | null
          channel: string | null
          created_at: string | null
          id: string
          message_text: string
          role: string
          sender_name: string
        }
        Insert: {
          attachment_filename?: string | null
          avatar_letters?: string | null
          channel?: string | null
          created_at?: string | null
          id?: string
          message_text: string
          role: string
          sender_name: string
        }
        Update: {
          attachment_filename?: string | null
          avatar_letters?: string | null
          channel?: string | null
          created_at?: string | null
          id?: string
          message_text?: string
          role?: string
          sender_name?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          id: string
          joined_at: string | null
          permissions: Json | null
          role: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          permissions?: Json | null
          role?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          permissions?: Json | null
          role?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          allow_cross_chaining: boolean | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          owner_id: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          allow_cross_chaining?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          owner_id?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          allow_cross_chaining?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          owner_id?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_profile_role: {
        Args: {
          p_approved_role: string
          p_reason: string
          p_target_profile_id: string
        }
        Returns: undefined
      }
      backend_approve_profile_role: {
        Args: {
          p_actor_profile_id: string
          p_approved_role: string
          p_reason: string
          p_target_profile_id: string
        }
        Returns: undefined
      }
      create_table_dynamic: {
        Args: { columns_json: Json; table_name: string }
        Returns: boolean
      }
      crm_campaigns_claim_due: {
        Args: { p_limit: number }
        Returns: {
          channel: string
          created_at: string | null
          filter_query: Json | null
          html_body: string | null
          id: string
          images: Json | null
          list_id: string | null
          list_ids: Json | null
          name: string
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          style_preset: string | null
          subject: string | null
          text_body: string | null
          total_clicked: number | null
          total_opened: number | null
          total_recipients: number | null
          total_sent: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "crm_campaigns"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      crm_flow_queue_claim: {
        Args: { p_limit: number; p_lock_seconds?: number; p_worker: string }
        Returns: {
          attempts: number
          contact_id: string
          created_at: string
          event_data: Json
          finished_at: string | null
          flow_id: string
          id: string
          last_error: string | null
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          resume_step_order: number
          run_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "crm_flow_step_queue"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      drop_table_safe: { Args: { table_name: string }; Returns: boolean }
      get_all_tables: {
        Args: never
        Returns: {
          created_at: string
          has_rls: boolean
          row_count: number
          table_name: string
          total_size: string
        }[]
      }
      get_all_triggers: {
        Args: { tbl?: string }
        Returns: {
          table_name: string
          trigger_event: string
          trigger_function: string
          trigger_name: string
          trigger_timing: string
        }[]
      }
      get_rls_policies: {
        Args: { p_table_name?: string }
        Returns: {
          check_expression: string
          output_table_name: string
          policy_name: string
          policy_type: string
          roles: string[]
          schema_name: string
          using_expression: string
        }[]
      }
      get_table_schema: {
        Args: { table_name: string }
        Returns: {
          column_default: string
          column_name: string
          data_type: string
          foreign_table: string
          is_foreign_key: boolean
          is_nullable: string
          is_primary_key: boolean
        }[]
      }
      get_table_statistics: { Args: { table_name: string }; Returns: Json }
      list_profile_role_audit: {
        Args: { p_limit?: number }
        Returns: {
          actor_profile_id: string
          approved_role: string
          created_at: string
          previous_role: string
          reason: string
          target_profile_id: string
        }[]
      }
      prepare_admin_auth_binding: {
        Args: {
          p_expires_at: string
          p_normalized_email: string
          p_profile_id: string
          p_token_hash: string
        }
        Returns: undefined
      }
      profile_id_for_auth_user: {
        Args: { p_auth_user_id: string }
        Returns: string
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
