"use client";
import { sb } from "../supabase/client";
import type { Database } from "../types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export async function addMessage(
  conversationId: string,
  role: Message["role"],
  content: string,
  extras?: Partial<Pick<Message, "parent_message_id" | "metadata" | "message_status">>
) {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const payload: Database["public"]["Tables"]["messages"]["Insert"] = {
    conversation_id: conversationId,
    user_id: user.id,
    role,
    content,
    message_status: extras?.message_status ?? "sent",
    parent_message_id: extras?.parent_message_id ?? null,
    metadata: extras?.metadata ?? {},
    tokens: null,
    deleted_at: null,
  };

  const { data, error } = await sb
    .from("messages")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as Message; // sequence is set by trigger
}

export async function getMessages(conversationId: string) {
  const { data, error } = await sb
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("sequence", { ascending: true });
  if (error) throw error;
  return data as Message[];
}

export async function updateMessageStatus(id: number, status: Message["message_status"]) {
  const { data, error } = await sb
    .from("messages")
    .update({ message_status: status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Message;
}