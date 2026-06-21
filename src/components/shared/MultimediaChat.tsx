import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send, Loader2, RotateCcw, Mic, MicOff, Camera,
  MonitorUp, Paperclip, X, Image as ImageIcon, Handshake, Video, Square,
  Volume2, VolumeX
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import MedicalDisclaimer from "./MedicalDisclaimer";
import CertificateGenerator from "./CertificateGenerator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Award } from "lucide-react";
import { speak, stopSpeaking } from "@/lib/speak";

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
  onDeputize?: () => void;
  deputizeLabel?: string;
}

const MultimediaChat = ({
  messages, onSend, isLoading, placeholder,
  suggestions = [], onNewChat, accentColor = "wellness", sessionId = "",
  onDeputize, deputizeLabel,
}: Props) => {
  const [input, setInput] = useState("");
  const { t, language } = useLanguage();
  const [certOpenIndex, setCertOpenIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const lastSpokenRef = useRef<number>(-1);
  // Video recording state
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [videoRecorder, setVideoRecorder] = useState<MediaRecorder | null>(null);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoElapsed, setVideoElapsed] = useState(0);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoTimerRef = useRef<number | null>(null);
  const VIDEO_MAX_SECONDS = 15;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-speak the latest assistant reply when voice mode is on.
  useEffect(() => {
    if (!voiceMode) return;
    const lastIdx = messages.length - 1;
    const last = messages[lastIdx];
    if (last?.role === "assistant" && lastIdx !== lastSpokenRef.current) {
      lastSpokenRef.current = lastIdx;
      speak(last.content, language);
    }
  }, [messages, voiceMode, language]);

  useEffect(() => () => stopSpeaking(), []);

  // Cleanup video stream if component unmounts mid-recording
  useEffect(() => () => {
    if (videoTimerRef.current) window.clearInterval(videoTimerRef.current);
    videoStream?.getTracks().forEach(t => t.stop());
  }, [videoStream]);

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

  // Voice recording — auto-transcribes and sends as a message.
  const toggleRecording = useCallback(async () => {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      const mimeType = ["audio/webm", "audio/mp4"].find((tp) =>
        (window as unknown as { MediaRecorder: typeof MediaRecorder }).MediaRecorder?.isTypeSupported?.(tp),
      );
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunks, { type });
        stream.getTracks().forEach(tr => tr.stop());
        if (blob.size < 1024) {
          toast.error(language === "ar" ? "التسجيل فارغ — حاول مرة أخرى" : "Recording empty — try again");
          return;
        }
        const ext = type.includes("mp4") ? "mp4" : "webm";
        const file = new File([blob], `voice-${Date.now()}.${ext}`, { type });
        setTranscribing(true);
        try {
          const form = new FormData();
          form.append("file", file);
          form.append("language", language);
          const { data, error } = await supabase.functions.invoke("voice-transcribe", {
            body: form,
          });
          if (error) throw error;
          const text = (data as { text?: string })?.text?.trim();
          if (!text) {
            toast.error(language === "ar" ? "تعذّر فهم الصوت" : "Couldn't understand audio");
            return;
          }
          onSend(text);
          setVoiceMode(true); // turn on speaker so the reply is read aloud
        } catch (e) {
          console.error(e);
          toast.error(language === "ar" ? "فشل تفريغ الصوت" : "Transcription failed");
        } finally {
          setTranscribing(false);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  }, [isRecording, mediaRecorder, language, onSend]);

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

  // ---- Video capture: record short clip, extract keyframes + transcribe audio ----
  const stopVideoRecording = useCallback(() => {
    videoRecorder?.state === "recording" && videoRecorder.stop();
  }, [videoRecorder]);

  const extractFramesFromBlob = async (blob: Blob, count = 4): Promise<File[]> => {
    const url = URL.createObjectURL(blob);
    const v = document.createElement("video");
    v.src = url;
    v.muted = true;
    v.playsInline = true;
    await new Promise<void>((res, rej) => {
      v.onloadedmetadata = () => res();
      v.onerror = () => rej(new Error("video metadata failed"));
    });
    // Some browsers report Infinity duration for MediaRecorder blobs; nudge it.
    if (!isFinite(v.duration) || v.duration === 0) {
      await new Promise<void>((res) => {
        v.currentTime = 1e6;
        v.ontimeupdate = () => { v.ontimeupdate = null; res(); };
      });
      v.currentTime = 0;
    }
    const duration = isFinite(v.duration) && v.duration > 0 ? v.duration : 5;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth || 640;
    canvas.height = v.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    const files: File[] = [];
    for (let i = 0; i < count; i++) {
      const t = (duration * (i + 0.5)) / count;
      await new Promise<void>((res) => {
        v.onseeked = () => { v.onseeked = null; res(); };
        v.currentTime = Math.min(t, Math.max(0, duration - 0.05));
      });
      ctx?.drawImage(v, 0, 0, canvas.width, canvas.height);
      const fileBlob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.82));
      if (fileBlob) files.push(new File([fileBlob], `frame-${Date.now()}-${i}.jpg`, { type: "image/jpeg" }));
    }
    URL.revokeObjectURL(url);
    return files;
  };

  const startVideoRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      setVideoStream(stream);
      setTimeout(() => {
        if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;
      }, 50);

      const mimeType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]
        .find((tp) => MediaRecorder.isTypeSupported?.(tp));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      recorder.onstop = async () => {
        if (videoTimerRef.current) { window.clearInterval(videoTimerRef.current); videoTimerRef.current = null; }
        stream.getTracks().forEach(t => t.stop());
        setVideoStream(null);
        setIsRecordingVideo(false);
        setVideoElapsed(0);
        const type = recorder.mimeType || "video/webm";
        const blob = new Blob(chunks, { type });
        if (blob.size < 2048) {
          toast.error(language === "ar" ? "الفيديو فارغ — حاول مجدداً" : "Video empty — try again");
          return;
        }
        setTranscribing(true);
        try {
          const frames = await extractFramesFromBlob(blob, 4);
          if (frames.length === 0) throw new Error("no frames");
          setAttachedFiles(prev => [...prev, ...frames]);

          // Try to transcribe audio track for context (best-effort).
          try {
            const form = new FormData();
            form.append("file", new File([blob], `video-${Date.now()}.webm`, { type }));
            form.append("language", language);
            const { data } = await supabase.functions.invoke("voice-transcribe", { body: form });
            const text = (data as { text?: string })?.text?.trim();
            if (text) setInput((prev) => (prev ? prev + " " : "") + text);
          } catch (e) {
            console.warn("video transcription skipped", e);
          }

          toast.success(language === "ar" ? "تم تسجيل الفيديو" : "Video captured");
        } catch (e) {
          console.error(e);
          toast.error(language === "ar" ? "فشل معالجة الفيديو" : "Failed to process video");
        } finally {
          setTranscribing(false);
        }
      };
      recorder.start();
      setVideoRecorder(recorder);
      setIsRecordingVideo(true);
      setVideoElapsed(0);
      videoTimerRef.current = window.setInterval(() => {
        setVideoElapsed((s) => {
          const next = s + 1;
          if (next >= VIDEO_MAX_SECONDS) recorder.state === "recording" && recorder.stop();
          return next;
        });
      }, 1000);
    } catch (err) {
      toast.error(language === "ar" ? "تعذّر الوصول للكاميرا" : "Camera/mic access denied");
    }
  }, [language]);

  const toggleVideo = useCallback(() => {
    if (isRecordingVideo) stopVideoRecording();
    else startVideoRecording();
  }, [isRecordingVideo, startVideoRecording, stopVideoRecording]);

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
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
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
            {msg.role === "assistant" && (
              <>
                {certOpenIndex === i ? (
                  <div className="max-w-[85%] w-full">
                    <CertificateGenerator
                      messageContent={msg.content}
                      sessionId={sessionId}
                      onClose={() => setCertOpenIndex(null)}
                      accent={accentColor}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setCertOpenIndex(i)}
                    className={`mt-1 flex items-center gap-1.5 text-xs ${accentStyles.text} hover:opacity-80 transition-opacity px-2 py-1 rounded-lg ${accentStyles.bg}`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    {t("assist.generate_cert")}
                  </button>
                )}
              </>
            )}
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

      {/* Video recording preview */}
      {isRecordingVideo && (
        <div className="relative mx-4 mb-2 rounded-lg overflow-hidden border border-emergency">
          <video ref={videoPreviewRef} autoPlay playsInline muted className="w-full max-h-48 object-cover" />
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-emergency text-white text-xs px-2 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            REC {videoElapsed}s / {VIDEO_MAX_SECONDS}s
          </div>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <Button size="sm" variant="destructive" onClick={stopVideoRecording}>
              <Square className="w-4 h-4 mr-1" /> {language === "ar" ? "إيقاف" : "Stop"}
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

      {/* Big push-to-talk bar — for users who can't read/type */}
      <div className="px-3 pt-2">
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleRecording}
            disabled={transcribing || isLoading}
            className={`flex-1 h-12 text-base font-semibold ${
              isRecording
                ? "bg-emergency hover:bg-emergency/90 text-white animate-pulse"
                : accentStyles.btn + " text-white"
            }`}
          >
            {transcribing ? (
              <><Loader2 className="w-5 h-5 me-2 animate-spin" /> {language === "ar" ? "جارٍ التفريغ..." : "Transcribing..."}</>
            ) : isRecording ? (
              <><MicOff className="w-5 h-5 me-2" /> {language === "ar" ? "اضغط للإيقاف" : "Tap to stop"}</>
            ) : (
              <><Mic className="w-5 h-5 me-2" /> {language === "ar" ? "اضغط للتحدث" : "Tap to speak"}</>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (voiceMode) { stopSpeaking(); setVoiceMode(false); }
              else { setVoiceMode(true); }
            }}
            className="h-12 w-12 shrink-0"
            title={voiceMode ? "Mute spoken replies" : "Read replies aloud"}
          >
            {voiceMode ? <Volume2 className="w-5 h-5 text-wellness" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
          </Button>
        </div>
      </div>

      {/* Input area with multimedia controls */}
      <div className="border-t bg-card/50 p-3">
        <div className="flex items-end gap-2">
          {onNewChat && messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={onNewChat} className="shrink-0" title="New Chat">
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}

          {onDeputize && messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDeputize}
              className={`shrink-0 ${accentStyles.text}`}
              title={deputizeLabel || "Deputize to the other AI"}
            >
              <Handshake className="w-4 h-4" />
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
              onClick={toggleVideo}
              disabled={transcribing}
              className={`h-9 w-9 ${isRecordingVideo ? "text-emergency animate-pulse" : "text-muted-foreground"}`}
              title={language === "ar" ? "تسجيل فيديو" : "Record video"}
            >
              {isRecordingVideo ? <Square className="w-4 h-4" /> : <Video className="w-4 h-4" />}
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
