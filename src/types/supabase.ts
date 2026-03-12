export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      admin_feedback: {
        Row: {
          admin_id: string;
          applicant_id: string;
          created_at: string;
          feedback: string | null;
          id: string;
        };
        Insert: {
          admin_id?: string;
          applicant_id?: string;
          created_at?: string;
          feedback?: string | null;
          id?: string;
        };
        Update: {
          admin_id?: string;
          applicant_id?: string;
          created_at?: string;
          feedback?: string | null;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_feedback_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admin_feedback_applicant_id_fkey";
            columns: ["applicant_id"];
            isOneToOne: false;
            referencedRelation: "applicants";
            referencedColumns: ["id"];
          },
        ];
      };
      applicant_skills: {
        Row: {
          applicant_id: string;
          created_at: string;
          id: string;
          rating: number;
          tag_id: number;
        };
        Insert: {
          applicant_id: string;
          created_at?: string;
          id?: string;
          rating?: number;
          tag_id: number;
        };
        Update: {
          applicant_id?: string;
          created_at?: string;
          id?: string;
          rating?: number;
          tag_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "applicant_skills_applicant_id_fkey";
            columns: ["applicant_id"];
            isOneToOne: false;
            referencedRelation: "applicants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applicant_skills_skill_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      applicants: {
        Row: {
          city: string | null;
          contact_number: string | null;
          created_at: string;
          email: string | null;
          first_name: string;
          id: string;
          joblisting_id: string;
          last_name: string;
          parsed_resume_id: string | null;
          platform: string | null;
          resume_id: string;
          scheduled_at: string | null;
          score_id: string | null;
          state: string | null;
          status: Database["public"]["Enums"]["candidate_status"];
          street: string | null;
          transcribed_id: string | null;
          transcript_id: string;
          zip: string | null;
        };
        Insert: {
          city?: string | null;
          contact_number?: string | null;
          created_at?: string;
          email?: string | null;
          first_name: string;
          id?: string;
          joblisting_id: string;
          last_name: string;
          parsed_resume_id?: string | null;
          platform?: string | null;
          resume_id: string;
          scheduled_at?: string | null;
          score_id?: string | null;
          state?: string | null;
          status?: Database["public"]["Enums"]["candidate_status"];
          street?: string | null;
          transcribed_id?: string | null;
          transcript_id: string;
          zip?: string | null;
        };
        Update: {
          city?: string | null;
          contact_number?: string | null;
          created_at?: string;
          email?: string | null;
          first_name?: string;
          id?: string;
          joblisting_id?: string;
          last_name?: string;
          parsed_resume_id?: string | null;
          platform?: string | null;
          resume_id?: string;
          scheduled_at?: string | null;
          score_id?: string | null;
          state?: string | null;
          status?: Database["public"]["Enums"]["candidate_status"];
          street?: string | null;
          transcribed_id?: string | null;
          transcript_id?: string;
          zip?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "applicants_joblisting_id_fkey";
            columns: ["joblisting_id"];
            isOneToOne: false;
            referencedRelation: "job_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applicants_parsed_resume_id_fkey";
            columns: ["parsed_resume_id"];
            isOneToOne: false;
            referencedRelation: "parsed_resume";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applicants_score_id_fkey";
            columns: ["score_id"];
            isOneToOne: false;
            referencedRelation: "scored_candidates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applicants_transcribed_id_fkey";
            columns: ["transcribed_id"];
            isOneToOne: false;
            referencedRelation: "transcribed";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["action_type"];
          actor_id: string | null;
          actor_type: Database["public"]["Enums"]["user_roles"];
          changes: Json;
          created_at: string;
          details: string;
          entity_id: string;
          entity_type: Database["public"]["Enums"]["audit_entity_type"];
          event_type: Database["public"]["Enums"]["audit_event_type"];
          id: string;
        };
        Insert: {
          action: Database["public"]["Enums"]["action_type"];
          actor_id?: string | null;
          actor_type: Database["public"]["Enums"]["user_roles"];
          changes?: Json;
          created_at?: string;
          details: string;
          entity_id: string;
          entity_type: Database["public"]["Enums"]["audit_entity_type"];
          event_type: Database["public"]["Enums"]["audit_event_type"];
          id?: string;
        };
        Update: {
          action?: Database["public"]["Enums"]["action_type"];
          actor_id?: string | null;
          actor_type?: Database["public"]["Enums"]["user_roles"];
          changes?: Json;
          created_at?: string;
          details?: string;
          entity_id?: string;
          entity_type?: Database["public"]["Enums"]["audit_entity_type"];
          event_type?: Database["public"]["Enums"]["audit_event_type"];
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
        ];
      };
      conversation_messages: {
        Row: {
          conversation_id: string;
          created_at: string;
          id: string;
          message: string;
          role: string;
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          id?: string;
          message: string;
          role: string;
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          id?: string;
          message?: string;
          role?: string;
        };
        Relationships: [];
      };
      hr_reports: {
        Row: {
          applicant_id: string;
          candidate_status: Database["public"]["Enums"]["candidate_status"];
          created_at: string;
          file_pathname: string | null;
          id: string;
          score: number;
          staff_id: string;
          summary: string;
        };
        Insert: {
          applicant_id?: string;
          candidate_status?: Database["public"]["Enums"]["candidate_status"];
          created_at?: string;
          file_pathname?: string | null;
          id?: string;
          score: number;
          staff_id?: string;
          summary: string;
        };
        Update: {
          applicant_id?: string;
          candidate_status?: Database["public"]["Enums"]["candidate_status"];
          created_at?: string;
          file_pathname?: string | null;
          id?: string;
          score?: number;
          staff_id?: string;
          summary?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hr_report_applicant_id_fkey";
            columns: ["applicant_id"];
            isOneToOne: false;
            referencedRelation: "applicants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "hr_report_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
        ];
      };
      jl_qualifications: {
        Row: {
          id: string;
          joblisting_id: string;
          qualification: string;
        };
        Insert: {
          id?: string;
          joblisting_id: string;
          qualification: string;
        };
        Update: {
          id?: string;
          joblisting_id?: string;
          qualification?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jl_qualifications_joblisting_id_fkey";
            columns: ["joblisting_id"];
            isOneToOne: false;
            referencedRelation: "job_listings";
            referencedColumns: ["id"];
          },
        ];
      };
      jl_requirements: {
        Row: {
          id: string;
          joblisting_id: string;
          requirement: string;
        };
        Insert: {
          id?: string;
          joblisting_id: string;
          requirement: string;
        };
        Update: {
          id?: string;
          joblisting_id?: string;
          requirement?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jl_requirements_joblisting_id_fkey";
            columns: ["joblisting_id"];
            isOneToOne: false;
            referencedRelation: "job_listings";
            referencedColumns: ["id"];
          },
        ];
      };
      job_listings: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          is_fulltime: boolean;
          location: string;
          staff_id: string | null;
          title: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          is_fulltime?: boolean;
          location: string;
          staff_id?: string | null;
          title: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          is_fulltime?: boolean;
          location?: string;
          staff_id?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_listings_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_listings_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
        ];
      };
      job_tags: {
        Row: {
          joblisting_id: string;
          tag_id: number;
        };
        Insert: {
          joblisting_id: string;
          tag_id: number;
        };
        Update: {
          joblisting_id?: string;
          tag_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "job_tags_job_id_fkey";
            columns: ["joblisting_id"];
            isOneToOne: false;
            referencedRelation: "job_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      key_highlights: {
        Row: {
          created_at: string;
          highlight: string;
          id: string;
          report_id: string;
        };
        Insert: {
          created_at?: string;
          highlight: string;
          id?: string;
          report_id: string;
        };
        Update: {
          created_at?: string;
          highlight?: string;
          id?: string;
          report_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "key_highlights_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "hr_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      parsed_resume: {
        Row: {
          created_at: string;
          id: string;
          parsed_resume: Json;
        };
        Insert: {
          created_at?: string;
          id?: string;
          parsed_resume: Json;
        };
        Update: {
          created_at?: string;
          id?: string;
          parsed_resume?: Json;
        };
        Relationships: [];
      };
      scored_candidates: {
        Row: {
          created_at: string;
          id: string;
          score_data: Json;
        };
        Insert: {
          created_at?: string;
          id?: string;
          score_data: Json;
        };
        Update: {
          created_at?: string;
          id?: string;
          score_data?: Json;
        };
        Relationships: [];
      };
      social_links: {
        Row: {
          applicant_id: string;
          id: string;
          link: string;
        };
        Insert: {
          applicant_id: string;
          id?: string;
          link: string;
        };
        Update: {
          applicant_id?: string;
          id?: string;
          link?: string;
        };
        Relationships: [
          {
            foreignKeyName: "social_links_applicant_id_fkey";
            columns: ["applicant_id"];
            isOneToOne: false;
            referencedRelation: "applicants";
            referencedColumns: ["id"];
          },
        ];
      };
      staff: {
        Row: {
          created_at: string;
          firebase_uid: string;
          first_name: string;
          id: string;
          last_name: string;
          role: Database["public"]["Enums"]["user_roles"];
        };
        Insert: {
          created_at?: string;
          firebase_uid: string;
          first_name: string;
          id?: string;
          last_name: string;
          role: Database["public"]["Enums"]["user_roles"];
        };
        Update: {
          created_at?: string;
          firebase_uid?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
          role?: Database["public"]["Enums"]["user_roles"];
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: number;
          name: string;
          slug: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          slug?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          slug?: string | null;
        };
        Relationships: [];
      };
      transcribed: {
        Row: {
          created_at: string;
          id: string;
          transcription: Json;
        };
        Insert: {
          created_at?: string;
          id?: string;
          transcription: Json;
        };
        Update: {
          created_at?: string;
          id?: string;
          transcription?: Json;
        };
        Relationships: [];
      };
    };
    Views: {
      daily_active_jobs_last_7_days: {
        Row: {
          date: string | null;
          dow: number | null;
          jobs: number | null;
          weekday: string | null;
        };
        Relationships: [];
      };
      weekly_applicants_last_4_weeks: {
        Row: {
          applicants: number | null;
          iso_week: string | null;
          week_end: string | null;
          week_start: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      compute_hiring_success_and_time_to_hire: {
        Args: { from_ts?: string; to_ts?: string };
        Returns: {
          metric_type: string;
          p50: number;
          p75: number;
          p90: number;
          status_or_stage: string;
          value: number;
        }[];
      };
      count_applicants_by_status: {
        Args: never;
        Returns: {
          applicants_count: number;
          status: Database["public"]["Enums"]["candidate_status"];
        }[];
      };
      get_ai_metrics_overall_by_month: {
        Args: { p_month: number; p_year: number };
        Returns: {
          avg_job_fit_score: number;
          avg_response_time: number;
        }[];
      };
      get_ai_metrics_weekly_by_month: {
        Args: { p_month: number; p_year: number };
        Returns: {
          avg_job_fit_score: number;
          avg_response_time: number;
          week: number;
        }[];
      };
      get_bottleneck_percentiles: {
        Args: { from_ts: string; to_ts: string };
        Returns: {
          p50_interval: string;
          p50_seconds: number;
          p75_interval: string;
          p75_seconds: number;
          p90_interval: string;
          p90_seconds: number;
          samples: number;
          status: string;
        }[];
      };
      get_hiring_kpis:
        | {
            Args: { from_ts: string; to_ts: string };
            Returns: {
              metric_type: string;
              p50: number;
              p75: number;
              p90: number;
              status_or_stage: string;
              value: number;
            }[];
          }
        | { Args: { end_date: string; start_date: string }; Returns: Json };
      get_top_candidates_by_job_fit: {
        Args: { p_limit?: number };
        Returns: {
          applicant_id: string;
          email: string;
          first_name: string;
          job_fit_score: number;
          last_name: string;
          score_data: Json;
          score_id: string;
          status: Database["public"]["Enums"]["candidate_status"];
        }[];
      };
    };
    Enums: {
      action_type: "create" | "update" | "delete";
      audit_entity_type:
        | "Applicant"
        | "Job Listing"
        | "Admin Feedback"
        | "Staff Evaluation"
        | "Staff";
      audit_event_type:
        | "Joblisting modified"
        | "Joblisting deleted"
        | "Created joblisting"
        | "Applied for job"
        | "Changed user role"
        | "Changed candidate status"
        | "Admin feedback created"
        | "Admin feedback deleted"
        | "Admin feedback updated"
        | "Created Staff Evaluation"
        | "Deleted Staff Evaluation"
        | "Updated Staff Evaluation"
        | "Created staff account"
        | "Staff password updated";
      candidate_status:
        | "Paper Screening"
        | "Exam"
        | "HR Interview"
        | "Technical Interview"
        | "Final Interview"
        | "Job Offer"
        | "Accepted Job Offer"
        | "Close Status";
      user_roles: "SuperAdmin" | "Admin" | "Staff" | "Applicant";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      action_type: ["create", "update", "delete"],
      audit_entity_type: [
        "Applicant",
        "Job Listing",
        "Admin Feedback",
        "Staff Evaluation",
        "Staff",
      ],
      audit_event_type: [
        "Joblisting modified",
        "Joblisting deleted",
        "Created joblisting",
        "Applied for job",
        "Changed user role",
        "Changed candidate status",
        "Admin feedback created",
        "Admin feedback deleted",
        "Admin feedback updated",
        "Created Staff Evaluation",
        "Deleted Staff Evaluation",
        "Updated Staff Evaluation",
        "Created staff account",
        "Staff password updated",
      ],
      candidate_status: [
        "Paper Screening",
        "Exam",
        "HR Interview",
        "Technical Interview",
        "Final Interview",
        "Job Offer",
        "Accepted Job Offer",
        "Close Status",
      ],
      user_roles: ["SuperAdmin", "Admin", "Staff", "Applicant"],
    },
  },
} as const;
