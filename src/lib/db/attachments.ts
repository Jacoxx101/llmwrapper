"use client";
import { sb } from "../supabase/client";
import type { Database } from "../types";

type Attachment = Database["public"]["Tables"]["message_attachments"]["Row"];

/** Upload a File to private bucket 'uploads' and create DB row */
export async function uploadAttachment(messageId: number, file: File) {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${crypto.randomUUID()}.${ext}`;

  // upload file
  const { data: up, error: upErr } = await sb.storage
    .from("uploads")
    .upload(path, file, { contentType: file.type });
  if (upErr) throw upErr;

  // generate signed URL (client-read) or keep as private
  const { data: signed } = await sb.storage.from("uploads").createSignedUrl(path, 60 * 60);

  // insert DB record
  const { data, error } = await sb
    .from("message_attachments")
    .insert([{
      message_id: messageId,
      file_name: file.name,
      file_url: signed?.signedUrl ?? up?.path ?? path,
      file_type: file.type || "application/octet-stream",
      file_size: file.size,
      metadata: {},
    }])
    .select()
    .single();

  if (error) throw error;
  return data as Attachment;
}

export async function listAttachments(messageId: number) {
  const { data, error } = await sb
    .from("message_attachments")
    .select("*")
    .eq("message_id", messageId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Attachment[];
}