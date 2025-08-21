"use client";
import { sb } from "../supabase/client";
import type { Database } from "../types";

type Conversation = Database["public"]["Tables"]["conversations"]["Row"];

export async function createConversation(title?: string) {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await sb
    .from("conversations")
    .insert([{ user_id: user.id, title }])
    .select()
    .single();

  if (error) throw error;
  return data as Conversation;
}

export async function listConversations() {
  const { data, error } = await sb
    .from("conversations")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as Conversation[];
}

export async function getConversation(id: string) {
  const { data, error } = await sb
    .from("conversations")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Conversation;
}

export async function setConversationStatus(id: string, status: "active" | "archived" | "deleted") {
  const { data, error } = await sb
    .from("conversations")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Conversation;
}