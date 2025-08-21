export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          status: "active" | "archived" | "deleted";
          model: string | null;
          metadata: Json;
          message_seq: number;
          daily_message_count: number;
          last_message_reset: string;
          created_at: string;
          updated_at: string;
          last_message_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["conversations"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Row"]>;
      };
      messages: {
        Row: {
          id: number;
          conversation_id: string;
          user_id: string;
          role: "user" | "assistant" | "system" | "tool";
          content: string;
          message_status: "sent" | "delivered" | "read" | "failed";
          sequence: number | null;
          parent_message_id: number | null;
          tokens: number | null;
          metadata: Json;
          created_at: string;
          deleted_at: string | null;
          search_vector: unknown;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at" | "sequence" | "search_vector">;
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
      };
      message_attachments: {
        Row: {
          id: string;
          message_id: number;
          file_name: string;
          file_url: string;
          file_type: string;
          file_size: number;
          metadata: Json;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["message_attachments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["message_attachments"]["Row"]>;
      };
      tool_calls: {
        Row: { id: number; message_id: number; name: string; arguments: Json; result: Json | null; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["tool_calls"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["tool_calls"]["Row"]>;
      };
    };
    Functions: {
      search_messages: {
        Args: { q: string; conv_id?: string | null; lim?: number; ofs?: number };
        Returns: Array<{
          id: number; conversation_id: string; user_id: string;
          role: "user" | "assistant" | "system" | "tool";
          content: string; created_at: string; rank: number;
        }>;
      };
    };
  };
};