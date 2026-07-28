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
      activity_event_sources: {
        Row: {
          event_id: string
          position: number
          source_id: string
        }
        Insert: {
          event_id: string
          position?: number
          source_id: string
        }
        Update: {
          event_id?: string
          position?: number
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_event_sources_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "activity_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_event_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_events: {
        Row: {
          action: string
          actor: string
          actor_name: string
          at: string
          decision: string | null
          detail: string
          id: string
          request_id: string | null
          workspace_id: string
        }
        Insert: {
          action: string
          actor: string
          actor_name: string
          at?: string
          decision?: string | null
          detail: string
          id: string
          request_id?: string | null
          workspace_id: string
        }
        Update: {
          action?: string
          actor?: string
          actor_name?: string
          at?: string
          decision?: string | null
          detail?: string
          id?: string
          request_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "request_overview"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "activity_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_events_seed: {
        Row: {
          id: string | null
        }
        Insert: {
          id?: string | null
        }
        Update: {
          id?: string | null
        }
        Relationships: []
      }
      answer_citations: {
        Row: {
          answer_id: string
          is_conflict: boolean
          passage_id: string
          position: number
          reason: string
          source_id: string
        }
        Insert: {
          answer_id: string
          is_conflict?: boolean
          passage_id: string
          position: number
          reason: string
          source_id: string
        }
        Update: {
          answer_id?: string
          is_conflict?: boolean
          passage_id?: string
          position?: number
          reason?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answer_citations_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answer_citations_source_id_passage_id_fkey"
            columns: ["source_id", "passage_id"]
            isOneToOne: false
            referencedRelation: "source_passages"
            referencedColumns: ["source_id", "passage_id"]
          },
        ]
      }
      answers: {
        Row: {
          answer: string
          caveats: string[]
          confidence: string
          conflict_note: string | null
          id: string
          position: number
          question: string
          request_id: string | null
        }
        Insert: {
          answer: string
          caveats?: string[]
          confidence: string
          conflict_note?: string | null
          id: string
          position?: number
          question: string
          request_id?: string | null
        }
        Update: {
          answer?: string
          caveats?: string[]
          confidence?: string
          conflict_note?: string | null
          id?: string
          position?: number
          question?: string
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "request_overview"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "answers_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      app_users: {
        Row: {
          can_approve: boolean
          id: string
          initials: string
          is_current_user: boolean
          name: string
          position: number
          role: string
          workspace_id: string
        }
        Insert: {
          can_approve?: boolean
          id: string
          initials: string
          is_current_user?: boolean
          name: string
          position?: number
          role: string
          workspace_id: string
        }
        Update: {
          can_approve?: boolean
          id?: string
          initials?: string
          is_current_user?: boolean
          name?: string
          position?: number
          role?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_users_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          city: string
          contact_email: string
          contact_name: string
          fiscal_year_end: string
          id: string
          legal_form: string
          mandant_number: string
          name: string
          position: number
          responsible_user_id: string
          services: string[]
          workspace_id: string
        }
        Insert: {
          city: string
          contact_email: string
          contact_name: string
          fiscal_year_end: string
          id: string
          legal_form: string
          mandant_number: string
          name: string
          position?: number
          responsible_user_id: string
          services?: string[]
          workspace_id: string
        }
        Update: {
          city?: string
          contact_email?: string
          contact_name?: string
          fiscal_year_end?: string
          id?: string
          legal_form?: string
          mandant_number?: string
          name?: string
          position?: number
          responsible_user_id?: string
          services?: string[]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_responsible_user_id_fkey"
            columns: ["responsible_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_section_citations: {
        Row: {
          draft_id: string
          passage_id: string
          position: number
          reason: string
          section_position: number
          source_id: string
        }
        Insert: {
          draft_id: string
          passage_id: string
          position: number
          reason: string
          section_position: number
          source_id: string
        }
        Update: {
          draft_id?: string
          passage_id?: string
          position?: number
          reason?: string
          section_position?: number
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_section_citations_draft_id_section_position_fkey"
            columns: ["draft_id", "section_position"]
            isOneToOne: false
            referencedRelation: "draft_sections"
            referencedColumns: ["draft_id", "position"]
          },
          {
            foreignKeyName: "draft_section_citations_source_id_passage_id_fkey"
            columns: ["source_id", "passage_id"]
            isOneToOne: false
            referencedRelation: "source_passages"
            referencedColumns: ["source_id", "passage_id"]
          },
        ]
      }
      draft_sections: {
        Row: {
          body: string
          draft_id: string
          heading: string
          position: number
        }
        Insert: {
          body: string
          draft_id: string
          heading: string
          position: number
        }
        Update: {
          body?: string
          draft_id?: string
          heading?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "draft_sections_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_sections_seed: {
        Row: {
          body: string | null
          draft_id: string | null
          heading: string | null
          position: number | null
        }
        Insert: {
          body?: string | null
          draft_id?: string | null
          heading?: string | null
          position?: number | null
        }
        Update: {
          body?: string | null
          draft_id?: string | null
          heading?: string | null
          position?: number | null
        }
        Relationships: []
      }
      drafts: {
        Row: {
          confidence: string
          generated_at: string
          id: string
          is_external: boolean
          kind: string
          open_questions: string[]
          recipient: string
          request_id: string
          status: string
          subject: string
          title: string
        }
        Insert: {
          confidence: string
          generated_at: string
          id: string
          is_external: boolean
          kind: string
          open_questions?: string[]
          recipient: string
          request_id: string
          status: string
          subject: string
          title: string
        }
        Update: {
          confidence?: string
          generated_at?: string
          id?: string
          is_external?: boolean
          kind?: string
          open_questions?: string[]
          recipient?: string
          request_id?: string
          status?: string
          subject?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "drafts_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "request_overview"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "drafts_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      drafts_seed: {
        Row: {
          confidence: string | null
          generated_at: string | null
          id: string | null
          is_external: boolean | null
          kind: string | null
          open_questions: string[] | null
          recipient: string | null
          request_id: string | null
          status: string | null
          subject: string | null
          title: string | null
        }
        Insert: {
          confidence?: string | null
          generated_at?: string | null
          id?: string | null
          is_external?: boolean | null
          kind?: string | null
          open_questions?: string[] | null
          recipient?: string | null
          request_id?: string | null
          status?: string | null
          subject?: string | null
          title?: string | null
        }
        Update: {
          confidence?: string | null
          generated_at?: string | null
          id?: string | null
          is_external?: boolean | null
          kind?: string | null
          open_questions?: string[] | null
          recipient?: string | null
          request_id?: string | null
          status?: string | null
          subject?: string | null
          title?: string | null
        }
        Relationships: []
      }
      intake_fields: {
        Row: {
          help: string
          id: string
          label: string
          options: string[] | null
          position: number
          request_id: string
          required: boolean
          required_by_passage_id: string | null
          required_by_reason: string | null
          required_by_source_id: string | null
          status: string
          type: string
          value: string | null
        }
        Insert: {
          help?: string
          id: string
          label: string
          options?: string[] | null
          position?: number
          request_id: string
          required?: boolean
          required_by_passage_id?: string | null
          required_by_reason?: string | null
          required_by_source_id?: string | null
          status: string
          type: string
          value?: string | null
        }
        Update: {
          help?: string
          id?: string
          label?: string
          options?: string[] | null
          position?: number
          request_id?: string
          required?: boolean
          required_by_passage_id?: string | null
          required_by_reason?: string | null
          required_by_source_id?: string | null
          status?: string
          type?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intake_fields_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "request_overview"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "intake_fields_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_fields_required_by_source_id_required_by_passage_id_fkey"
            columns: ["required_by_source_id", "required_by_passage_id"]
            isOneToOne: false
            referencedRelation: "source_passages"
            referencedColumns: ["source_id", "passage_id"]
          },
        ]
      }
      intake_fields_seed: {
        Row: {
          help: string | null
          id: string | null
          label: string | null
          options: string[] | null
          position: number | null
          request_id: string | null
          required: boolean | null
          required_by_passage_id: string | null
          required_by_reason: string | null
          required_by_source_id: string | null
          status: string | null
          type: string | null
          value: string | null
        }
        Insert: {
          help?: string | null
          id?: string | null
          label?: string | null
          options?: string[] | null
          position?: number | null
          request_id?: string | null
          required?: boolean | null
          required_by_passage_id?: string | null
          required_by_reason?: string | null
          required_by_source_id?: string | null
          status?: string | null
          type?: string | null
          value?: string | null
        }
        Update: {
          help?: string | null
          id?: string | null
          label?: string | null
          options?: string[] | null
          position?: number | null
          request_id?: string | null
          required?: boolean | null
          required_by_passage_id?: string | null
          required_by_reason?: string | null
          required_by_source_id?: string | null
          status?: string | null
          type?: string | null
          value?: string | null
        }
        Relationships: []
      }
      knowledge_entries: {
        Row: {
          answer_id: string
          id: string
          position: number
          prompt: string
          suggested: boolean
          workspace_id: string
        }
        Insert: {
          answer_id: string
          id: string
          position?: number
          prompt: string
          suggested?: boolean
          workspace_id: string
        }
        Update: {
          answer_id?: string
          id?: string
          position?: number
          prompt?: string
          suggested?: boolean
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_entries_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_entries_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_retrievals: {
        Row: {
          knowledge_entry_id: string
          note: string
          passage_id: string
          position: number
          source_id: string
          used: boolean
        }
        Insert: {
          knowledge_entry_id: string
          note: string
          passage_id: string
          position: number
          source_id: string
          used: boolean
        }
        Update: {
          knowledge_entry_id?: string
          note?: string
          passage_id?: string
          position?: number
          source_id?: string
          used?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_retrievals_knowledge_entry_id_fkey"
            columns: ["knowledge_entry_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_retrievals_source_id_passage_id_fkey"
            columns: ["source_id", "passage_id"]
            isOneToOne: false
            referencedRelation: "source_passages"
            referencedColumns: ["source_id", "passage_id"]
          },
        ]
      }
      query_expansion_cache: {
        Row: {
          created_at: string
          model_id: string
          normalized_query: string
          terms: string[]
        }
        Insert: {
          created_at?: string
          model_id: string
          normalized_query: string
          terms: string[]
        }
        Update: {
          created_at?: string
          model_id?: string
          normalized_query?: string
          terms?: string[]
        }
        Relationships: []
      }
      requests: {
        Row: {
          assigned_user_id: string
          body: string
          category: string
          category_confidence: string
          channel: string
          client_id: string
          due_date: string | null
          escalation_at: string | null
          escalation_reason: string | null
          escalation_to_user_id: string | null
          id: string
          lifecycle_status: string
          narrative_summary: string
          received_at: string
          reference: string
          subject: string
          workspace_id: string
        }
        Insert: {
          assigned_user_id: string
          body: string
          category: string
          category_confidence: string
          channel: string
          client_id: string
          due_date?: string | null
          escalation_at?: string | null
          escalation_reason?: string | null
          escalation_to_user_id?: string | null
          id: string
          lifecycle_status: string
          narrative_summary: string
          received_at: string
          reference: string
          subject: string
          workspace_id: string
        }
        Update: {
          assigned_user_id?: string
          body?: string
          category?: string
          category_confidence?: string
          channel?: string
          client_id?: string
          due_date?: string | null
          escalation_at?: string | null
          escalation_reason?: string | null
          escalation_to_user_id?: string | null
          id?: string
          lifecycle_status?: string
          narrative_summary?: string
          received_at?: string
          reference?: string
          subject?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_escalation_to_user_id_fkey"
            columns: ["escalation_to_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      requests_seed: {
        Row: {
          id: string | null
          lifecycle_status: string | null
        }
        Insert: {
          id?: string | null
          lifecycle_status?: string | null
        }
        Update: {
          id?: string | null
          lifecycle_status?: string | null
        }
        Relationships: []
      }
      retrieval_glossary: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          term_de: string[]
          term_en: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          notes?: string | null
          term_de: string[]
          term_en: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          term_de?: string[]
          term_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      source_passages: {
        Row: {
          fts: unknown
          locator: string
          passage_id: string
          position: number
          source_id: string
          text: string
        }
        Insert: {
          fts?: unknown
          locator: string
          passage_id: string
          position?: number
          source_id: string
          text: string
        }
        Update: {
          fts?: unknown
          locator?: string
          passage_id?: string
          position?: number
          source_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_passages_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      source_supersessions: {
        Row: {
          effective_note: string | null
          id: string
          relation: string
          scope: string | null
          source_id: string
          superseded_by_id: string | null
          target_label: string | null
        }
        Insert: {
          effective_note?: string | null
          id?: string
          relation?: string
          scope?: string | null
          source_id: string
          superseded_by_id?: string | null
          target_label?: string | null
        }
        Update: {
          effective_note?: string | null
          id?: string
          relation?: string
          scope?: string | null
          source_id?: string
          superseded_by_id?: string | null
          target_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_supersessions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_supersessions_superseded_by_id_fkey"
            columns: ["superseded_by_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          effective_from: string | null
          health: string
          id: string
          is_fictional: boolean
          is_public: boolean
          kind: string
          last_reviewed: string
          note: string | null
          position: number
          publisher: string
          short_title: string
          title: string
          url: string | null
          visibility: string
          workspace_id: string
        }
        Insert: {
          effective_from?: string | null
          health: string
          id: string
          is_fictional: boolean
          is_public: boolean
          kind: string
          last_reviewed: string
          note?: string | null
          position?: number
          publisher: string
          short_title: string
          title: string
          url?: string | null
          visibility: string
          workspace_id: string
        }
        Update: {
          effective_from?: string | null
          health?: string
          id?: string
          is_fictional?: boolean
          is_public?: boolean
          kind?: string
          last_reviewed?: string
          note?: string | null
          position?: number
          publisher?: string
          short_title?: string
          title?: string
          url?: string | null
          visibility?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sources_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          city: string
          firm_name: string
          headcount: number
          id: string
          is_fictional: boolean
          practice_system: string
          short_name: string
        }
        Insert: {
          city: string
          firm_name: string
          headcount: number
          id: string
          is_fictional?: boolean
          practice_system: string
          short_name: string
        }
        Update: {
          city?: string
          firm_name?: string
          headcount?: number
          id?: string
          is_fictional?: boolean
          practice_system?: string
          short_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      request_overview: {
        Row: {
          intake_missing: number | null
          intake_provided: number | null
          intake_readiness: string | null
          intake_total: number | null
          intake_uncertain: number | null
          request_id: string | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      reset_demo: { Args: never; Returns: undefined }
      search_passages: {
        Args: {
          caller_visibility?: string
          max_results?: number
          query_text: string
        }
        Returns: {
          anchor_hits: number
          anchor_rank: number
          exclusion_reason: string
          fts_rank: number
          fts_score: number
          fused_score: number
          locator: string
          passage_id: string
          source_id: string
          source_title: string
          text: string
          trgm_rank: number
          trgm_score: number
          url: string
          used: boolean
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
