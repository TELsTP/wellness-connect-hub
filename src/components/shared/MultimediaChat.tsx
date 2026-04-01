import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send, Loader2, RotateCcw, Mic, MicOff, Camera,
  MonitorUp, Paperclip, X, Image as ImageIcon
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import MedicalDisclaimer from "./MedicalDisclaimer";
import CertificateGenerator from "./CertificateGenerator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Award } from "lucide-react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  media?: { type: string; url: string; name?: string }[];
}

interface Props {
  messages: ChatMessage[];
  onSend: (message: string, media?: File[]) => void;
  isLoading: boolean;
  placeholder: string;
  suggestions?: string[];
  onNewChat?: () => void;
  accentColor?: "wellness" | "clinical";
  sessionId?: string;
}

const MultimediaChat = ({
  messages, onSend, isLoading, placeholder,
  suggestions = [], onNewChat, accentColor = "wellness"
}: Props) => {
  const [input, setInput] = useState("");
  const { t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;
    onSend(input.trim(), attachedFiles.length > 0 ? attachedFiles : undefined);
    setInput("");
    setAttachedFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice recording
  const toggleRecording = useCallback(async () => {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
        setAttachedFiles(prev => [...prev, file]);
        stream.getTracks().forEach(t => t.stop());
        toast.success("Voice message recorded");
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  }, [isRecording, mediaRecorder]);

  // Camera capture
  const toggleCamera = useCallback(async () => {
    if (showCamera && cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
      setShowCamera(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch (err) {
      toast.error("Camera access denied");
    }
  }, [showCamera, cameraStream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        setAttachedFiles(prev => [...prev, file]);
        toast.success("Photo captured");
      }
    }, "image/jpeg");
    toggleCamera();
  }, [toggleCamera]);

  // Screen share
  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new (window as any).ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const file = new File([blob], `screen-${Date.now()}.png`, { type: "image/png" });
          setAttachedFiles(prev => [...prev, file]);
          toast.success("Screen captured");
        }
      });
      stream.getTracks().forEach(t => t.stop());
    } catch (err) {
      toast.error("Screen share cancelled");
    }
  }, []);

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const accentStyles = accentColor === "clinical"
    ? { bg: "bg-clinical/10", border: "border-clinical/30", text: "text-clinical", userBg: "bg-clinical text-clinical-foreground", btn: "bg-clinical hover:bg-clinical/90" }
    : { bg: "bg-wellness/10", border: "border-wellness/30", text: "text-wellness", userBg: "bg-wellness text-wellness-foreground", btn: "bg-wellness hover:bg-wellness/90" };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && suggestions.length > 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-12">
            <div className={`w-16 h-16 rounded-2xl ${accentStyles.bg} flex items-center justify-center`}>
              <span className="text-3xl">🏥</span>
            </div>
            <p className="text-muted-foreground text-center text-sm max-w-md">{placeholder}</p>
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
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === "user"
                ? `${accentStyles.userBg} rounded-br-md`
                : "bg-card border rounded-bl-md"
            }`}>
              {msg.media && msg.media.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {msg.media.map((m, j) => (
                    m.type.startsWith("image") ? (
                      <img key={j} src={m.url} alt="attachment" className="w-32 h-24 object-cover rounded-lg" />
                    ) : m.type.startsWith("audio") ? (
                      <audio key={j} src={m.url} controls className="max-w-[200px]" />
                    ) : (
                      <div key={j} className="text-xs bg-muted rounded px-2 py-1">{m.name}</div>
                    )
                  ))}
                </div>
              )}
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2 [&_table]:text-xs">
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

      {/* Camera preview */}
      {showCamera && (
        <div className="relative mx-4 mb-2 rounded-lg overflow-hidden border">
          <video ref={videoRef} autoPlay playsInline className="w-full max-h-48 object-cover" />
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
            <Button size="sm" onClick={capturePhoto} className={`${accentStyles.btn} text-white`}>
              <Camera className="w-4 h-4 mr-1" /> Capture
            </Button>
            <Button size="sm" variant="destructive" onClick={toggleCamera}>
              <X className="w-4 h-4 mr-1" /> Close
            </Button>
          </div>
        </div>
      )}

      {/* Attached files preview */}
      {attachedFiles.length > 0 && (
        <div className="flex gap-2 px-4 pb-2 flex-wrap">
          {attachedFiles.map((file, i) => (
            <div key={i} className="relative bg-muted rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5">
              {file.type.startsWith("image") ? <ImageIcon className="w-3 h-3" /> :
               file.type.startsWith("audio") ? <Mic className="w-3 h-3" /> :
               <Paperclip className="w-3 h-3" />}
              <span className="max-w-[100px] truncate">{file.name}</span>
              <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <MedicalDisclaimer variant="compact" />

      {/* Input area with multimedia controls */}
      <div className="border-t bg-card/50 p-3">
        <div className="flex items-end gap-2">
          {onNewChat && messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={onNewChat} className="shrink-0" title="New Chat">
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}

          {/* Multimedia buttons */}
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRecording}
              className={`h-9 w-9 ${isRecording ? "text-emergency animate-pulse" : "text-muted-foreground"}`}
              title="Voice message"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCamera}
              className="h-9 w-9 text-muted-foreground"
              title="Camera"
            >
              <Camera className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={startScreenShare}
              className="h-9 w-9 text-muted-foreground"
              title="Screen share"
            >
              <MonitorUp className="w-4 h-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setAttachedFiles(prev => [...prev, ...files]);
                e.target.value = "";
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 w-9 text-muted-foreground"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[44px] max-h-32 resize-none text-sm"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
            size="icon"
            className={`shrink-0 ${accentStyles.btn} text-white`}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MultimediaChat;
