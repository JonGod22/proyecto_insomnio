// Generado desde el schema real de Supabase (proyecto ojxjbgmixxzetipjobhn, schema "insomnio").
// Este proyecto Supabase ahora es compartido: Insomnio vive en el schema
// "insomnio" y SocialPost en "social_post", separados dentro de la misma base.
// El generador automático (generate_typescript_types) solo lee "public" por
// defecto, así que este archivo se mantiene a mano — si cambia el schema de
// una tabla, actualizar aquí manualmente reflejando la migración SQL aplicada.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  insomnio: {
    Tables: {
      appointments: {
        Row: {
          business_id: string
          client_id: string
          created_at: string
          ends_at: string
          id: string
          notes: string | null
          service_id: string
          source: string
          staff_id: string | null
          starts_at: string
          status: string
        }
        Insert: {
          business_id: string
          client_id: string
          created_at?: string
          ends_at: string
          id?: string
          notes?: string | null
          service_id: string
          source?: string
          staff_id?: string | null
          starts_at: string
          status?: string
        }
        Update: {
          business_id?: string
          client_id?: string
          created_at?: string
          ends_at?: string
          id?: string
          notes?: string | null
          service_id?: string
          source?: string
          staff_id?: string | null
          starts_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          phone: string | null
          slug: string
          whatsapp_number: string | null
          working_hours: Json
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          phone?: string | null
          slug: string
          whatsapp_number?: string | null
          working_hours?: Json
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          phone?: string | null
          slug?: string
          whatsapp_number?: string | null
          working_hours?: Json
        }
        Relationships: []
      }
      clients: {
        Row: {
          business_id: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          last_visit_at: string | null
          notes: string | null
          phone: string
        }
        Insert: {
          business_id: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          last_visit_at?: string | null
          notes?: string | null
          phone: string
        }
        Update: {
          business_id?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          last_visit_at?: string | null
          notes?: string | null
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          business_id: string
          content: string
          created_at: string
          embedding: string | null
          id: string
          service_id: string | null
          title: string
        }
        Insert: {
          business_id: string
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          service_id?: string | null
          title: string
        }
        Update: {
          business_id?: string
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          service_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_base_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      landing: {
        Row: {
          business_id: string
          config_json: Json
          id: string
          updated_at: string
        }
        Insert: {
          business_id: string
          config_json?: Json
          id?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          config_json?: Json
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          business_id: string
          client_id: string
          created_at: string
          discount_amount: number | null
          id: string
          mercadopago_payment_id: string | null
          mercadopago_preference_id: string | null
          method: string
          notes: string | null
          status: string
          type: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          business_id: string
          client_id: string
          created_at?: string
          discount_amount?: number | null
          id?: string
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          method?: string
          notes?: string | null
          status?: string
          type: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          business_id?: string
          client_id?: string
          created_at?: string
          discount_amount?: number | null
          id?: string
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          method?: string
          notes?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_id: string
          created_at: string
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          business_id: string
          created_at?: string
          full_name?: string | null
          id: string
          role?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          business_id: string
          created_at: string
          deposit_amount: number | null
          description: string | null
          duration_minutes: number
          duration_minutes_max: number | null
          id: string
          info_content: string | null
          info_images: string[]
          name: string
          price: number | null
          price_on_request: boolean
          show_on_landing: boolean
        }
        Insert: {
          active?: boolean
          business_id: string
          created_at?: string
          deposit_amount?: number | null
          description?: string | null
          duration_minutes: number
          duration_minutes_max?: number | null
          id?: string
          info_content?: string | null
          info_images?: string[]
          name: string
          price?: number | null
          price_on_request?: boolean
          show_on_landing?: boolean
        }
        Update: {
          active?: boolean
          business_id?: string
          created_at?: string
          deposit_amount?: number | null
          description?: string | null
          duration_minutes?: number
          duration_minutes_max?: number | null
          id?: string
          info_content?: string | null
          info_images?: string[]
          name?: string
          price?: number | null
          price_on_request?: boolean
          show_on_landing?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_appointment_atomic: {
        Args: {
          p_business_id: string
          p_client_name: string
          p_client_phone: string
          p_service_id: string
          p_source?: string
          p_starts_at: string
        }
        Returns: {
          business_id: string
          client_id: string
          created_at: string
          ends_at: string
          id: string
          notes: string | null
          service_id: string
          source: string
          staff_id: string | null
          starts_at: string
          status: string
        }
      }
      get_available_slots: {
        Args: { p_business_id: string; p_date: string; p_service_id: string }
        Returns: {
          slot_end: string
          slot_start: string
        }[]
      }
      get_my_business_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["insomnio"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]

// ============================================================
// Tipos de dominio (alias legibles sobre las tablas generadas)
// ============================================================

export type Business = Tables<"businesses">
export type Profile = Tables<"profiles">
export type Service = Tables<"services">
export type Client = Tables<"clients">
export type Appointment = Tables<"appointments">
export type Payment = Tables<"payments">
export type KnowledgeBaseEntry = Tables<"knowledge_base">
export type Landing = Tables<"landing">

export type AppointmentStatus = Appointment["status"]
export type PaymentStatus = Payment["status"]
export type PaymentType = Payment["type"]
export type PaymentMethod = Payment["method"]
export type AppointmentSource = Appointment["source"]

// Forma de landing.config_json — no es una tabla generada (es jsonb), así
// que el tipo se mantiene a mano. Todas las secciones son opcionales y
// tienen un fallback razonable en la landing pública si faltan.
export type LandingConfig = {
  /** Título grande del hero — independiente de businesses.name a propósito
   * (ese sigue siendo el "símbolo" del nav/admin, este es 100% editorial). */
  hero_title?: string
  /** Logo en el encabezado (PNG/SVG) — si no está, se muestra el título como texto. */
  logo_url?: string
  /** Línea chica arriba del título (reemplaza el "dirección, ciudad"
   * calculado — texto libre, editorial). */
  location_label?: string
  hero_subtitle?: string
  hero_image_url?: string
  cta_label?: string
  map_embed_url?: string
  /** Links de contacto/redes adicionales al WhatsApp (hasta 3), título y URL
   * libres — reemplaza el viejo instagram_url fijo. */
  links?: { label: string; url: string }[]
  /** Id de una paleta curada (ver lib/landing-palettes.ts) — no colores libres. */
  theme_palette?: string
  /** Id de una tipografía curada (ver lib/landing-fonts.ts) — no fuentes libres. */
  font_id?: string
  benefits?: string[]
  gallery?: string[]
  sections?: {
    benefits?: boolean
    gallery?: boolean
    map?: boolean
  }
}

export type AvailableSlot = {
  slot_start: string
  slot_end: string
}
