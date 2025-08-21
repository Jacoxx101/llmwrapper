"use client";
import { sb } from "../supabase/client";

export async function searchMessages(q: string, conversationId?: string) {
  const { data, error } = await sb.rpc("search_messages", {
    q,
    conv_id: conversationId ?? null,
    lim: 50,
    ofs: 0,
  });
  if (error) throw error;
  return data;
}