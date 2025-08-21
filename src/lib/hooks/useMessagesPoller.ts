"use client";
import { useEffect, useRef, useState } from "react";
import { sb } from "../supabase/client";
import type { Database } from "../types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export function useMessagesPoller(conversationId: string | null, intervalMs = 2500) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const lastSeqRef = useRef<number>(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function initial() {
    if (!conversationId) return;
    setLoading(true);
    const { data } = await sb
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("sequence", { ascending: true });
    setLoading(false);
    if (!data) return;
    setMessages(data as Message[]);
    lastSeqRef.current = data.length ? (data[data.length - 1] as Message).sequence ?? 0 : 0;
  }

  async function fetchNew() {
    if (!conversationId) return;
    const { data } = await sb
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .gt("sequence", lastSeqRef.current)
      .order("sequence", { ascending: true });
    if (!data || !data.length) return;
    setMessages((prev) => {
      const merged = [...prev, ...(data as Message[])].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
      return merged;
    });
    lastSeqRef.current = (data[data.length - 1] as Message).sequence ?? lastSeqRef.current;
  }

  useEffect(() => {
    initial();
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(fetchNew, intervalMs);
    return () => { if (timer.current) clearInterval(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, intervalMs]);

  return { messages, loading, refresh: initial };
}