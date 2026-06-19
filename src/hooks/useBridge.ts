import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type BridgeFrom =
  | "wellness" | "assist"
  | "wellness-human" | "assist-human"
  | "wellness-ai" | "assist-ai";

export type BridgeMsg = {
  role: "system" | "user" | "assistant";
  from: BridgeFrom;
  kind?: "briefing" | "transcript" | "note";
  content: unknown;
  ts?: string;
};

export function useBridge(
  bridgeId: string | null,
  side: "wellness" | "assist",
  language: string,
) {
  const [messages, setMessages] = useState<BridgeMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const oppositeFn = useRef(side === "wellness" ? "assist-ai-persona" : "wellness-ai-persona");

  useEffect(() => {
    if (!bridgeId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("chats")
        .select("messages")
        .eq("session_id", bridgeId)
        .maybeSingle();
      if (!cancelled && Array.isArray(data?.messages)) {
        setMessages(data!.messages as unknown as BridgeMsg[]);
      }
    })();

    const channel = supabase
      .channel(`bridge-${bridgeId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chats", filter: `session_id=eq.${bridgeId}` },
        (payload: { new?: { messages?: unknown } }) => {
          const next = payload.new?.messages;
          if (Array.isArray(next)) setMessages(next as BridgeMsg[]);
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [bridgeId]);

  const persist = useCallback(
    async (next: BridgeMsg[]) => {
      if (!bridgeId) return;
      await supabase.from("chats").update({ messages: next as any }).eq("session_id", bridgeId);
    },
    [bridgeId],
  );

  const sendNote = useCallback(
    async (text: string) => {
      if (!bridgeId || !text.trim()) return;
      const humanFrom: BridgeFrom = side === "wellness" ? "wellness-human" : "assist-human";
      const oppositeAi: BridgeFrom = side === "wellness" ? "assist-ai" : "wellness-ai";

      const { data: row } = await supabase
        .from("chats").select("messages").eq("session_id", bridgeId).maybeSingle();
      const current = (Array.isArray(row?.messages) ? (row!.messages as unknown as BridgeMsg[]) : messages);
      const userMsg: BridgeMsg = {
        role: "user", from: humanFrom, content: text, ts: new Date().toISOString(),
      };
      const withUser = [...current, userMsg];
      await persist(withUser);
      setLoading(true);

      const apiMessages: { role: string; content: string }[] = [];
      apiMessages.push({
        role: "system",
        content: `You are operating in CROSS-AI BRIDGE mode. You are ${
          oppositeAi === "assist-ai" ? "My-AssistAI (clinical decision support)" : "My-WellnessAI (patient companion)"
        } collaborating with ${
          side === "wellness" ? "My-WellnessAI" : "My-AssistAI"
        } on a shared TELsTP case. Respond concisely to the latest message; address the other AI directly when useful. Keep your standard accreditation footer.`,
      });

      for (const m of withUser) {
        if (m.kind === "briefing") {
          apiMessages.push({ role: "system", content: `### Handoff briefing\n${String(m.content)}` });
        } else if (m.kind === "transcript") {
          const t = Array.isArray(m.content)
            ? (m.content as Array<{ role: string; content: unknown }>)
                .map((x) => `${x.role}: ${typeof x.content === "string" ? x.content : "[multimodal]"}`)
                .join("\n")
            : "";
          apiMessages.push({ role: "system", content: `### Original transcript from ${m.from}\n${t}` });
        } else if (m.role === "user" || m.role === "assistant") {
          apiMessages.push({
            role: m.role,
            content: `(${m.from}) ${typeof m.content === "string" ? m.content : ""}`,
          });
        }
      }

      try {
        const { data, error } = await supabase.functions.invoke(oppositeFn.current, {
          body: { messages: apiMessages, sessionId: bridgeId, language, bridgeMode: true },
        });
        if (error) throw error;
        const aiContent: string = (data as any)?.content || "(no response)";
        const aiMsg: BridgeMsg = {
          role: "assistant", from: oppositeAi, content: aiContent, ts: new Date().toISOString(),
        };
        const { data: row2 } = await supabase
          .from("chats").select("messages").eq("session_id", bridgeId).maybeSingle();
        const latest = (Array.isArray(row2?.messages) ? (row2!.messages as unknown as BridgeMsg[]) : withUser);
        await persist([...latest, aiMsg]);
      } catch (e) {
        console.error("bridge AI error", e);
      } finally {
        setLoading(false);
      }
    },
    [bridgeId, side, language, messages, persist],
  );

  return { messages, loading, sendNote };
}