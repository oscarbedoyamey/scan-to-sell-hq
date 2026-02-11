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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      leads: {
        Row: {
          consent: boolean | null
          created_at: string | null
          email: string | null
          id: string
          listing_id: string
          message: string | null
          name: string | null
          phone: string | null
          sign_id: string | null
        }
        Insert: {
          consent?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          listing_id: string
          message?: string | null
          name?: string | null
          phone?: string | null
          sign_id?: string | null
        }
        Update: {
          consent?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          listing_id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          sign_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_sign_id_fkey"
            columns: ["sign_id"]
            isOneToOne: false
            referencedRelation: "signs"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_translations: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          language: string
          listing_id: string
          title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          language: string
          listing_id: string
          title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          language?: string
          listing_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_translations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_translations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          agency_logo_url: string | null
          agency_name: string | null
          auto_renew: boolean
          base_language: string | null
          bathrooms: number | null
          bedrooms: number | null
          built_area_m2: number | null
          city: string | null
          condition: Database["public"]["Enums"]["property_condition"] | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          elevator: boolean | null
          energy_rating: string | null
          features: Json | null
          floor: string | null
          floorplan_url: string | null
          gallery_urls: Json | null
          hide_exact_address: boolean | null
          id: string
          lat: number | null
          lead_form_enabled: boolean | null
          listing_code: string | null
          lng: number | null
          number: string | null
          operation_type: Database["public"]["Enums"]["operation_type"] | null
          owner_user_id: string
          parking: boolean | null
          plot_area_m2: number | null
          postal_code: string | null
          price_rent: number | null
          price_sale: number | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          reference_code: string | null
          region: string | null
          show_email: boolean | null
          show_phone: boolean | null
          show_price: boolean | null
          show_whatsapp: boolean | null
          status: Database["public"]["Enums"]["listing_status"] | null
          street: string | null
          title: string | null
          updated_at: string | null
          video_url: string | null
          virtual_tour_url: string | null
          website_url: string | null
          year_built: number | null
        }
        Insert: {
          agency_logo_url?: string | null
          agency_name?: string | null
          auto_renew?: boolean
          base_language?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_area_m2?: number | null
          city?: string | null
          condition?: Database["public"]["Enums"]["property_condition"] | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          elevator?: boolean | null
          energy_rating?: string | null
          features?: Json | null
          floor?: string | null
          floorplan_url?: string | null
          gallery_urls?: Json | null
          hide_exact_address?: boolean | null
          id?: string
          lat?: number | null
          lead_form_enabled?: boolean | null
          listing_code?: string | null
          lng?: number | null
          number?: string | null
          operation_type?: Database["public"]["Enums"]["operation_type"] | null
          owner_user_id: string
          parking?: boolean | null
          plot_area_m2?: number | null
          postal_code?: string | null
          price_rent?: number | null
          price_sale?: number | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          reference_code?: string | null
          region?: string | null
          show_email?: boolean | null
          show_phone?: boolean | null
          show_price?: boolean | null
          show_whatsapp?: boolean | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          street?: string | null
          title?: string | null
          updated_at?: string | null
          video_url?: string | null
          virtual_tour_url?: string | null
          website_url?: string | null
          year_built?: number | null
        }
        Update: {
          agency_logo_url?: string | null
          agency_name?: string | null
          auto_renew?: boolean
          base_language?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_area_m2?: number | null
          city?: string | null
          condition?: Database["public"]["Enums"]["property_condition"] | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          elevator?: boolean | null
          energy_rating?: string | null
          features?: Json | null
          floor?: string | null
          floorplan_url?: string | null
          gallery_urls?: Json | null
          hide_exact_address?: boolean | null
          id?: string
          lat?: number | null
          lead_form_enabled?: boolean | null
          listing_code?: string | null
          lng?: number | null
          number?: string | null
          operation_type?: Database["public"]["Enums"]["operation_type"] | null
          owner_user_id?: string
          parking?: boolean | null
          plot_area_m2?: number | null
          postal_code?: string | null
          price_rent?: number | null
          price_sale?: number | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          reference_code?: string | null
          region?: string | null
          show_email?: boolean | null
          show_phone?: boolean | null
          show_price?: boolean | null
          show_whatsapp?: boolean | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          street?: string | null
          title?: string | null
          updated_at?: string | null
          video_url?: string | null
          virtual_tour_url?: string | null
          website_url?: string | null
          year_built?: number | null
        }
        Relationships: []
      }
      packages: {
        Row: {
          active: boolean | null
          created_at: string | null
          duration_months: number
          id: string
          price_eur: number
          stripe_price_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          duration_months: number
          id: string
          price_eur: number
          stripe_price_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          duration_months?: number
          id?: string
          price_eur?: number
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          locale: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          locale?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          locale?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_eur: number | null
          created_at: string | null
          end_at: string | null
          id: string
          listing_id: string | null
          package_id: string | null
          start_at: string | null
          status: Database["public"]["Enums"]["purchase_status"] | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          amount_eur?: number | null
          created_at?: string | null
          end_at?: string | null
          id?: string
          listing_id?: string | null
          package_id?: string | null
          start_at?: string | null
          status?: Database["public"]["Enums"]["purchase_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          amount_eur?: number | null
          created_at?: string | null
          end_at?: string | null
          id?: string
          listing_id?: string | null
          package_id?: string | null
          start_at?: string | null
          status?: Database["public"]["Enums"]["purchase_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      scans: {
        Row: {
          city: string | null
          country: string | null
          device: string | null
          id: string
          ip_hash: string | null
          listing_id: string | null
          occurred_at: string | null
          referrer: string | null
          sign_id: string | null
          user_agent: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          device?: string | null
          id?: string
          ip_hash?: string | null
          listing_id?: string | null
          occurred_at?: string | null
          referrer?: string | null
          sign_id?: string | null
          user_agent?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          device?: string | null
          id?: string
          ip_hash?: string | null
          listing_id?: string | null
          occurred_at?: string | null
          referrer?: string | null
          sign_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scans_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scans_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scans_sign_id_fkey"
            columns: ["sign_id"]
            isOneToOne: false
            referencedRelation: "signs"
            referencedColumns: ["id"]
          },
        ]
      }
      sign_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          listing_id: string
          sign_id: string
          unassigned_at: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          listing_id: string
          sign_id: string
          unassigned_at?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          listing_id?: string
          sign_id?: string
          unassigned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sign_assignments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sign_assignments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sign_assignments_sign_id_fkey"
            columns: ["sign_id"]
            isOneToOne: false
            referencedRelation: "signs"
            referencedColumns: ["id"]
          },
        ]
      }
      signs: {
        Row: {
          created_at: string | null
          headline_text: string | null
          id: string
          language: string | null
          listing_id: string | null
          orientation: Database["public"]["Enums"]["sign_orientation"] | null
          public_url: string | null
          qr_image_path: string | null
          show_email: boolean | null
          show_icons: Json | null
          show_phone: boolean | null
          show_price: boolean | null
          show_sale_rent_badge: boolean | null
          show_whatsapp: boolean | null
          sign_code: string
          sign_pdf_path: string | null
          size: Database["public"]["Enums"]["sign_size"] | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          headline_text?: string | null
          id?: string
          language?: string | null
          listing_id?: string | null
          orientation?: Database["public"]["Enums"]["sign_orientation"] | null
          public_url?: string | null
          qr_image_path?: string | null
          show_email?: boolean | null
          show_icons?: Json | null
          show_phone?: boolean | null
          show_price?: boolean | null
          show_sale_rent_badge?: boolean | null
          show_whatsapp?: boolean | null
          sign_code: string
          sign_pdf_path?: string | null
          size?: Database["public"]["Enums"]["sign_size"] | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          headline_text?: string | null
          id?: string
          language?: string | null
          listing_id?: string | null
          orientation?: Database["public"]["Enums"]["sign_orientation"] | null
          public_url?: string | null
          qr_image_path?: string | null
          show_email?: boolean | null
          show_icons?: Json | null
          show_phone?: boolean | null
          show_price?: boolean | null
          show_sale_rent_badge?: boolean | null
          show_whatsapp?: boolean | null
          sign_code?: string
          sign_pdf_path?: string | null
          size?: Database["public"]["Enums"]["sign_size"] | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signs_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signs_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          kind: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id: string
          kind?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          kind?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      listings_public: {
        Row: {
          agency_logo_url: string | null
          agency_name: string | null
          base_language: string | null
          bathrooms: number | null
          bedrooms: number | null
          built_area_m2: number | null
          city: string | null
          condition: Database["public"]["Enums"]["property_condition"] | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          elevator: boolean | null
          energy_rating: string | null
          features: Json | null
          floor: string | null
          floorplan_url: string | null
          gallery_urls: Json | null
          hide_exact_address: boolean | null
          id: string | null
          lat: number | null
          lead_form_enabled: boolean | null
          lng: number | null
          number: string | null
          operation_type: Database["public"]["Enums"]["operation_type"] | null
          owner_user_id: string | null
          parking: boolean | null
          plot_area_m2: number | null
          postal_code: string | null
          price_rent: number | null
          price_sale: number | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          reference_code: string | null
          region: string | null
          show_email: boolean | null
          show_phone: boolean | null
          show_price: boolean | null
          show_whatsapp: boolean | null
          status: Database["public"]["Enums"]["listing_status"] | null
          street: string | null
          title: string | null
          updated_at: string | null
          video_url: string | null
          virtual_tour_url: string | null
          website_url: string | null
          year_built: number | null
        }
        Insert: {
          agency_logo_url?: string | null
          agency_name?: string | null
          base_language?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_area_m2?: number | null
          city?: string | null
          condition?: Database["public"]["Enums"]["property_condition"] | null
          contact_email?: never
          contact_name?: string | null
          contact_phone?: never
          contact_whatsapp?: never
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          elevator?: boolean | null
          energy_rating?: string | null
          features?: Json | null
          floor?: string | null
          floorplan_url?: string | null
          gallery_urls?: Json | null
          hide_exact_address?: boolean | null
          id?: string | null
          lat?: never
          lead_form_enabled?: boolean | null
          lng?: never
          number?: never
          operation_type?: Database["public"]["Enums"]["operation_type"] | null
          owner_user_id?: string | null
          parking?: boolean | null
          plot_area_m2?: number | null
          postal_code?: string | null
          price_rent?: number | null
          price_sale?: number | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          reference_code?: string | null
          region?: string | null
          show_email?: boolean | null
          show_phone?: boolean | null
          show_price?: boolean | null
          show_whatsapp?: boolean | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          street?: never
          title?: string | null
          updated_at?: string | null
          video_url?: string | null
          virtual_tour_url?: string | null
          website_url?: string | null
          year_built?: number | null
        }
        Update: {
          agency_logo_url?: string | null
          agency_name?: string | null
          base_language?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_area_m2?: number | null
          city?: string | null
          condition?: Database["public"]["Enums"]["property_condition"] | null
          contact_email?: never
          contact_name?: string | null
          contact_phone?: never
          contact_whatsapp?: never
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          elevator?: boolean | null
          energy_rating?: string | null
          features?: Json | null
          floor?: string | null
          floorplan_url?: string | null
          gallery_urls?: Json | null
          hide_exact_address?: boolean | null
          id?: string | null
          lat?: never
          lead_form_enabled?: boolean | null
          lng?: never
          number?: never
          operation_type?: Database["public"]["Enums"]["operation_type"] | null
          owner_user_id?: string | null
          parking?: boolean | null
          plot_area_m2?: number | null
          postal_code?: string | null
          price_rent?: number | null
          price_sale?: number | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          reference_code?: string | null
          region?: string | null
          show_email?: boolean | null
          show_phone?: boolean | null
          show_price?: boolean | null
          show_whatsapp?: boolean | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          street?: never
          title?: string | null
          updated_at?: string | null
          video_url?: string | null
          virtual_tour_url?: string | null
          website_url?: string | null
          year_built?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
      listing_status: "draft" | "active" | "paused" | "expired"
      operation_type: "sale" | "rent"
      property_condition: "new" | "good" | "needs_renovation"
      property_type:
        | "apartment"
        | "house"
        | "villa"
        | "land"
        | "commercial"
        | "office"
        | "garage"
        | "other"
      purchase_status: "pending" | "paid" | "failed" | "refunded"
      sign_orientation: "portrait" | "landscape"
      sign_size: "A4" | "A3"
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
    Enums: {
      app_role: ["admin", "customer"],
      listing_status: ["draft", "active", "paused", "expired"],
      operation_type: ["sale", "rent"],
      property_condition: ["new", "good", "needs_renovation"],
      property_type: [
        "apartment",
        "house",
        "villa",
        "land",
        "commercial",
        "office",
        "garage",
        "other",
      ],
      purchase_status: ["pending", "paid", "failed", "refunded"],
      sign_orientation: ["portrait", "landscape"],
      sign_size: ["A4", "A3"],
    },
  },
} as const
