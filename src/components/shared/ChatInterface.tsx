import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import MedicalDisclaimer from "./MedicalDisclaimer";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder: string;
  suggestions?: string[];
  onNewChat?: () => void;
  accentColor?: "wellness" | "clinical";
}

const ChatInterface = ({ messages, onSend, isLoading, placeholder, suggestions = [], onNewChat, accentColor = "wellness" }: Props) => {
  const [input, setInput] = useState("");
  const { t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const accentStyles = accentColor === "clinical"
    ? { bg: "bg-clinical/10", border: "border-clinical/30", text: "text-clinical", userBg: "bg-clinical text-clinical-foreground" }
    : { bg: "bg-wellness/10", border: "border-wellness/30", text: "text-wellness", userBg: "bg-wellness text-wellness-foreground" };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && suggestions.length > 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-12">
            <div className={`w-16 h-16 rounded-2xl ${accentStyles.bg} flex items-center justify-center`}>
              <span className="text-3xl">🏥</span>
            </div>
            <p className="text-muted-foreground text-center text-sm max-w-md">
              {placeholder}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSend(s)}
                  className={`text-start text-sm p-3 rounded-lg border ${accentStyles.border} ${accentStyles.bg} hover:opacity-80 transition-opacity`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? `${accentStyles.userBg} rounded-br-md`
                  : "bg-card border rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t("common.loading")}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Disclaimer */}
      <MedicalDisclaimer variant="compact" />

      {/* Input area */}
      <div className="border-t bg-card/50 p-3">
        <div className="flex items-end gap-2">
          {onNewChat && messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={onNewChat} className="shrink-0">
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[44px] max-h-32 resize-none text-sm"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className={`shrink-0 ${accentColor === "clinical" ? "bg-clinical hover:bg-clinical/90" : "bg-wellness hover:bg-wellness/90"} text-white`}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
