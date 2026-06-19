import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { useBridge, type BridgeMsg, type BridgeFrom } from "@/hooks/useBridge";
import { Bot, Heart, Stethoscope, User, Handshake } from "lucide-react";

interface Props {
  bridgeId: string | null;
  side: "wellness" | "assist";
  language: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const META: Record<BridgeFrom, { name: string; Icon: typeof Bot; color: string }> = {
  "wellness":        { name: "Wellness session",  Icon: Heart,      color: "text-wellness" },
  "assist":          { name: "Assist session",    Icon: Stethoscope, color: "text-clinical" },
  "wellness-human":  { name: "Patient",           Icon: User,       color: "text-wellness" },
  "assist-human":    { name: "Clinician",         Icon: User,       color: "text-clinical" },
  "wellness-ai":     { name: "My-WellnessAI",     Icon: Bot,        color: "text-wellness" },
  "assist-ai":       { name: "My-AssistAI",       Icon: Bot,        color: "text-clinical" },
};

export default function BridgePanel({ bridgeId, side, language, open, onOpenChange }: Props) {
  const { messages, loading, sendNote } = useBridge(bridgeId, side, language);
  const [text, setText] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);

  const briefing = messages.find((m) => m.kind === "briefing");
  const transcript = messages.find((m) => m.kind === "transcript");
  const liveMsgs = messages.filter((m) => !m.kind);
  const oppositeLabel = side === "wellness" ? "My-AssistAI" : "My-WellnessAI";

  const handleSend = async () => {
    const t = text.trim();
    if (!t) return;
    setText("");
    await sendNote(t);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-base flex items-center gap-2">
            <Handshake className="w-4 h-4 text-wellness" />
            AI Deputization Bridge
          </SheetTitle>
          {bridgeId && (
            <div className="text-[10px] text-muted-foreground font-mono break-all">{bridgeId}</div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
          {!bridgeId && (
            <p className="text-xs text-muted-foreground italic text-center py-6">
              No active bridge. Use the handshake button in chat to deputize.
            </p>
          )}

          {briefing && (
            <div className="bg-muted/40 rounded-xl p-3 border">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Handoff briefing
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{String(briefing.content)}</ReactMarkdown>
              </div>
            </div>
          )}

          {transcript && Array.isArray(transcript.content) && (
            <div>
              <button
                onClick={() => setShowTranscript((s) => !s)}
                className="text-xs underline text-muted-foreground"
              >
                {showTranscript ? "Hide" : "Show"} original transcript ({(transcript.content as unknown[]).length} msgs)
              </button>
              {showTranscript && (
                <div className="mt-2 bg-card border rounded-lg p-2 max-h-60 overflow-y-auto text-xs space-y-1">
                  {(transcript.content as Array<{ role: string; content: unknown }>).map((m, i) => (
                    <div key={i}>
                      <b className="capitalize">{m.role}:</b>{" "}
                      {typeof m.content === "string" ? m.content : "[multimodal]"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {bridgeId && liveMsgs.length === 0 && (
            <p className="text-xs text-muted-foreground italic text-center py-4">
              No bridge messages yet. Post a note below — {oppositeLabel} will reply.
            </p>
          )}

          {liveMsgs.map((m, i) => {
            const meta = META[m.from] || { name: m.from, Icon: Bot, color: "" };
            const Icon = meta.Icon;
            return (
              <div key={i} className="bg-card border rounded-xl p-3">
                <div className={`flex items-center gap-1.5 text-xs font-semibold mb-1 ${meta.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {meta.name}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-2 [&_table]:text-xs">
                  <ReactMarkdown>
                    {typeof m.content === "string" ? m.content : JSON.stringify(m.content)}
                  </ReactMarkdown>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="text-xs text-muted-foreground italic">{oppositeLabel} is replying…</div>
          )}
        </div>

        <div className="border-t p-3 space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Ask ${oppositeLabel}…`}
            className="min-h-[60px] text-sm"
          />
          <Button
            onClick={handleSend}
            disabled={!text.trim() || loading || !bridgeId}
            className="w-full"
            size="sm"
          >
            Send to bridge
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}