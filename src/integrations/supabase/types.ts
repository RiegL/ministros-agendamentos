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
      agendamentos: {
        Row: {
          created_at: string
          data: string
          doente_id: string
          hora: string
          id: string
          ministro_id: string
          ministro_secundario_id: string | null
          observacoes: string | null
          status: string
        }
        Insert: {
          created_at?: string
          data: string
          doente_id: string
          hora: string
          id?: string
          ministro_id: string
          ministro_secundario_id?: string | null
          observacoes?: string | null
          status: string
        }
        Update: {
          created_at?: string
          data?: string
          doente_id?: string
          hora?: string
          id?: string
          ministro_id?: string
          ministro_secundario_id?: string | null
          observacoes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_doente_id_fkey"
            columns: ["doente_id"]
            isOneToOne: false
            referencedRelation: "doentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_ministro_id_fkey"
            columns: ["ministro_id"]
            isOneToOne: false
            referencedRelation: "ministros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_ministro_secundario_id_fkey"
            columns: ["ministro_secundario_id"]
            isOneToOne: false
            referencedRelation: "ministros"
            referencedColumns: ["id"]
          },
        ]
      }
      doentes: {
        Row: {
          cadastrado_por: string
          created_at: string
          endereco: string
          id: string
          latitude: number | null
          longitude: number | null
          nome: string
          observacoes: string | null
          setor: string
          // telefone: string
        }
        Insert: {
          cadastrado_por: string
          created_at?: string
          endereco: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome: string
          observacoes?: string | null
          setor: string
          // telefone: string
        }
        Update: {
          cadastrado_por?: string
          created_at?: string
          endereco?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string
          observacoes?: string | null
          setor?: string
          // telefone?: string
        }
        Relationships: [
          {
            foreignKeyName: "doentes_cadastrado_por_fkey"
            columns: ["cadastrado_por"]
            isOneToOne: false
            referencedRelation: "ministros"
            referencedColumns: ["id"]
          },
        ]
      }
      ministros: {
        Row: {
          created_at: string
          email: string
          id: string
          id_auth: string | null
          nome: string
          role: string
          senha: string
          telefone: string
          codigo: number
          disabled: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          id_auth?: string | null
          nome: string
          role: string
          senha: string
          telefone: string
          codigo: number
          disabled: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          id_auth?: string | null
          nome?: string
          role?: string
          senha?: string
          telefone?: string
          codigo: number
          disabled: boolean
        }
        Relationships: []
      }
      telefones_doente: {
        Row: {
          created_at: string
          descricao: string | null
          doente_id: string | null
          id: string
          numero: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          doente_id?: string | null
          id?: string
          numero: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          doente_id?: string | null
          id?: string
          numero?: string
        }
        Relationships: [
          {
            foreignKeyName: "telefones_doente_doente_id_fkey"
            columns: ["doente_id"]
            isOneToOne: false
            referencedRelation: "doentes"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
