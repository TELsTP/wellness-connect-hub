import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Bot, Loader2, FileText, Copy, Stethoscope, FileDown } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { SignalingChannel, ICE_SERVERS, type SignalRole } from "@/lib/webrtc/signaling";
import { speak, stopSpeaking } from "@/lib/speak";
import { VitalsPanel } from "@/components/shared/VitalsPanel";
import { VitalsCharts } from "@/components/shared/VitalsCharts";
import { SkinScanPanel } from "@/components/shared/SkinScanPanel";
import type { LiveVitalsSample } from "@/lib/vitals/bluetooth";
import type { SkinAssessment } from "@/lib/vitals/skin";
import { summarizeVitals, vitalsBriefing, vitalsToCsv } from "@/lib/vitals/summary";
import { downloadTimelinePdf } from "@/lib/reports/timelinePdf";
import { uploadArtifact, listArtifacts, type StoredArtifact } from "@/lib/artifacts";

type TranscriptTurn = { role: "patient" | "clinician" | "ai"; text: string; ts: string };

const CHUNK_MS = 15000;

const CallRoom = () => {
  const { roomId = "" } = useParams();
  const [params] = useSearchParams();
  const role = (params.get("role") === "clinician" ? "clinician" : "patient") as SignalRole;
  const navigate = useNavigate();
  const { language, isRtl } = useLanguage();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const signalingRef = useRef<SignalingChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunkRecorderRef = useRef<MediaRecorder | null>(null);
  const transcriptRef = useRef<TranscriptTurn[]>([]);
  const encounterIdRef = useRef<string | null>(null);
  const fullChunksRef = useRef<Blob[]>([]);

  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [peerJoined, setPeerJoined] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [aiActive, setAiActive] = useState(true);
  const [aiThinking, setAiThinking] = useState(false);
  const [soapNote, setSoapNote] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [callStarted] = useState(() => new Date());
  const [samples, setSamples] = useState<LiveVitalsSample[]>([]);
  const [skin, setSkin] = useState<SkinAssessment | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [triage, setTriage] = useState<string | null>(null);
  const [triaging, setTriaging] = useState(false);
  const [artifacts, setArtifacts] = useState<StoredArtifact[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const sessionIdRef = useRef<string>(`session-${role}-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now()}`);

  const samplesRef = useRef<LiveVitalsSample[]>([]);
  const skinRef = useRef<SkinAssessment | null>(null);
  const triageRef = useRef<string | null>(null);
  const addSample = useCallback((s: LiveVitalsSample) => {
    samplesRef.current = [...samplesRef.current.slice(-299), s];
    setSamples(samplesRef.current);
  }, []);


  const appendTurn = useCallback((turn: TranscriptTurn) => {
    transcriptRef.current = [...transcriptRef.current, turn];
    setTranscript(transcriptRef.current);
    // Persist to encounter row
    if (encounterIdRef.current) {
      supabase.from("encounters").update({ transcript: transcriptRef.current as any }).eq("id", encounterIdRef.current).then();
    }
  }, []);

  const askDeputy = useCallback(async (latestPatientText: string) => {
    if (!aiActive) return;
    setAiThinking(true);
    try {
      const history = transcriptRef.current.map((t) => ({
        role: t.role === "ai" ? "assistant" : "user",
        content: `${t.role.toUpperCase()}: ${t.text}`,
      }));
      const { data, error } = await supabase.functions.invoke("call-deputy", {
        body: {
          roomId,
          language,
          history,
          latest: latestPatientText,
          clinicianPresent: peerJoined && role === "patient",
        },
      });
      if (error) throw error;
      const reply: string = data?.reply || "";
      if (reply) {
        const turn: TranscriptTurn = { role: "ai", text: reply, ts: new Date().toISOString() };
        appendTurn(turn);
        // Only speak aloud if no clinician is on the call yet — otherwise stay a silent scribe
        if (!peerJoined && role === "patient") {
          speak(reply, (language as "en" | "ar" | "zh") || "en");
        }
      }
    } catch (e) {
      console.error("deputy error", e);
    } finally {
      setAiThinking(false);
    }
  }, [aiActive, appendTurn, language, peerJoined, role, roomId]);

  // 1. Get media, set up peer connection, start signaling
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: "user" } });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        pc.ontrack = (ev) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = ev.streams[0];
          }
        };
        pc.onicecandidate = (ev) => {
          if (ev.candidate) signalingRef.current?.sendIce(ev.candidate.toJSON());
        };

        const signaling = new SignalingChannel(roomId, role, {
          onPeerJoin: async (peer) => {
            setPeerJoined(true);
            toast.success(`${peer} joined`);
            // Patient (or whoever joined first) initiates the offer when the other arrives
            if (role === "patient") {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              await signaling.sendOffer(offer);
            }
          },
          onPeerLeave: () => {
            setPeerJoined(false);
            toast.info("Peer left");
          },
          onOffer: async (sdp) => {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await signaling.sendAnswer(answer);
          },
          onAnswer: async (sdp) => {
            if (!pc.currentRemoteDescription) {
              await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            }
          },
          onIce: async (candidate) => {
            try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
            catch (e) { console.warn("ice add failed", e); }
          },
        });
        signalingRef.current = signaling;
        await signaling.join();

        // Mark this side as joined in DB
        const sessionTag = `session-${role}-${Date.now()}`;
        const patch = role === "patient"
          ? { status: "active", started_at: new Date().toISOString(), patient_session: sessionTag }
          : { status: "active", started_at: new Date().toISOString(), clinician_session: sessionTag };
        await supabase.from("rooms").update(patch).eq("id", roomId);

        // Create encounter row (patient side owns it to avoid duplicates)
        if (role === "patient") {
          const { data: enc } = await supabase
            .from("encounters")
            .insert({ room_id: roomId, transcript: [] })
            .select("id")
            .single();
          if (enc) encounterIdRef.current = enc.id;
        } else {
          // Clinician fetches existing encounter
          const { data: enc } = await supabase
            .from("encounters")
            .select("id, transcript")
            .eq("room_id", roomId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (enc) {
            encounterIdRef.current = enc.id;
            if (Array.isArray(enc.transcript)) {
              transcriptRef.current = enc.transcript as TranscriptTurn[];
              setTranscript(transcriptRef.current);
            }
          }
        }

        // Start full-call recorder (for the doctor to review later)
        try {
          const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
            ? "video/webm;codecs=vp9,opus"
            : (MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "video/mp4");
          const full = new MediaRecorder(stream, { mimeType: mime });
          full.ondataavailable = (e) => { if (e.data && e.data.size) fullChunksRef.current.push(e.data); };
          full.start(2000);
          recorderRef.current = full;
        } catch (e) {
          console.warn("Full recorder unavailable", e);
        }

        // Patient side: stream audio chunks to STT and trigger AI deputy per turn
        if (role === "patient") startChunkedTranscription(stream);

        // Subscribe to encounter updates so clinician sees transcript live
        if (role === "clinician") subscribeToEncounter();
      } catch (e) {
        console.error("init failed", e);
        toast.error("Camera / microphone permission required");
      }
    };

    const startChunkedTranscription = (stream: MediaStream) => {
      const audioOnly = new MediaStream(stream.getAudioTracks());
      const tryStart = () => {
        const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
        const rec = new MediaRecorder(audioOnly, { mimeType: mime });
        const chunks: Blob[] = [];
        rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
        rec.onstop = async () => {
          const blob = new Blob(chunks, { type: mime });
          if (blob.size > 4000) {
            try {
              const fd = new FormData();
              fd.append("file", blob, mime === "audio/mp4" ? "chunk.mp4" : "chunk.webm");
              fd.append("language", language || "en");
              const projectRef = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID || "dbrxrhjveezxtfwvialj";
              const r = await fetch(`https://${projectRef}.supabase.co/functions/v1/voice-transcribe`, {
                method: "POST",
                headers: { Authorization: `Bearer ${(import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
                body: fd,
              });
              const d = await r.json();
              const text = (d?.text || "").trim();
              if (text && text.length > 2) {
                appendTurn({ role: "patient", text, ts: new Date().toISOString() });
                askDeputy(text);
              }
            } catch (err) {
              console.warn("chunk transcription failed", err);
            }
          }
          if (chunkRecorderRef.current === rec && pcRef.current && pcRef.current.connectionState !== "closed") {
            // Roll into next chunk
            tryStart();
          }
        };
        chunkRecorderRef.current = rec;
        rec.start();
        setTimeout(() => { try { rec.state === "recording" && rec.stop(); } catch { /* noop */ } }, CHUNK_MS);
      };
      tryStart();
    };

    const subscribeToEncounter = () => {
      const ch = supabase
        .channel(`encounter:${roomId}`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "encounters", filter: `room_id=eq.${roomId}` }, (p) => {
          const t = (p.new as any).transcript;
          if (Array.isArray(t)) {
            transcriptRef.current = t;
            setTranscript(t);
          }
        })
        .subscribe();
      return () => { supabase.removeChannel(ch); };
    };

    init();
    return () => {
      cancelled = true;
      try { chunkRecorderRef.current?.state === "recording" && chunkRecorderRef.current.stop(); } catch { /* noop */ }
      chunkRecorderRef.current = null;
      try { recorderRef.current?.state === "recording" && recorderRef.current.stop(); } catch { /* noop */ }
      pcRef.current?.getSenders().forEach((s) => s.track && s.track.stop());
      pcRef.current?.close();
      pcRef.current = null;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      signalingRef.current?.leave();
      stopSpeaking();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, role]);

  const toggleAudio = () => {
    const next = !audioOn;
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
    setAudioOn(next);
  };
  const toggleVideo = () => {
    const next = !videoOn;
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = next));
    setVideoOn(next);
  };

  const endCall = async () => {
    setFinalizing(true);
    try {
      try { chunkRecorderRef.current?.state === "recording" && chunkRecorderRef.current.stop(); } catch { /* noop */ }
      try { recorderRef.current?.state === "recording" && recorderRef.current.stop(); } catch { /* noop */ }
      await new Promise((r) => setTimeout(r, 300));

      // Build full recording blob for local download (no server bucket yet)
      if (fullChunksRef.current.length) {
        const blob = new Blob(fullChunksRef.current, { type: fullChunksRef.current[0].type || "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `encounter-${roomId}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      }

      // Ask backend for SOAP summary
      const { data, error } = await supabase.functions.invoke("encounter-finalize", {
        body: { roomId, encounterId: encounterIdRef.current, transcript: transcriptRef.current, language },
      });
      if (error) throw error;
      setSoapNote(data?.soap || "No summary generated.");

      await supabase.from("rooms").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", roomId);
    } catch (e) {
      console.error(e);
      toast.error("Could not finalize the encounter");
    } finally {
      setFinalizing(false);
    }
  };

  const copyRoomLink = async () => {
    const url = `${window.location.origin}/call/${roomId}?role=clinician`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Clinician link copied");
    } catch {
      toast.info(url);
    }
  };

  const elapsedMin = Math.floor((Date.now() - callStarted.getTime()) / 60000);

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={isRtl ? "rtl" : "ltr"}>
      <header className="border-b px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px]">{roomId}</Badge>
          <Badge className={peerJoined ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
            {peerJoined ? "Connected" : role === "patient" ? "Waiting for clinician" : "Joining…"}
          </Badge>
          {aiActive && (
            <Badge variant="secondary" className="gap-1">
              <Bot className="w-3 h-3" /> AI Deputy {aiThinking && <Loader2 className="w-3 h-3 animate-spin" />}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={copyRoomLink} className="gap-1 text-xs">
            <Copy className="w-3 h-3" /> Clinician link
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAiActive((v) => !v)} className="gap-1 text-xs">
            <Bot className="w-3 h-3" /> {aiActive ? "Mute AI" : "Wake AI"}
          </Button>
        </div>
      </header>

      <main className="flex-1 grid lg:grid-cols-[1fr_360px] gap-3 p-3">
        <div className="space-y-3">
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {!peerJoined && (
              <div className="absolute inset-0 grid place-items-center text-white/70 text-sm">
                Waiting for the other side to join…
              </div>
            )}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-3 end-3 w-28 sm:w-40 aspect-video rounded-md border border-white/30 object-cover bg-black"
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button onClick={toggleAudio} variant={audioOn ? "secondary" : "destructive"} size="icon" aria-label="toggle mic">
              {audioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <Button onClick={toggleVideo} variant={videoOn ? "secondary" : "destructive"} size="icon" aria-label="toggle camera">
              {videoOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>
            <Button onClick={endCall} variant="destructive" className="gap-2" disabled={finalizing}>
              {finalizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneOff className="w-4 h-4" />}
              End & summarize
            </Button>
          </div>

          <Card className="p-3">
            <VitalsPanel roomId={roomId} sessionId={sessionIdRef.current} readOnly={role === "clinician"} />
          </Card>
        </div>

        <aside className="space-y-3 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-2 text-xs font-medium">
              <FileText className="w-3.5 h-3.5" /> Live transcript · {elapsedMin}m
            </div>
            <div className="space-y-2 text-xs">
              {transcript.length === 0 && <p className="text-muted-foreground italic">Waiting for the first words…</p>}
              {transcript.map((t, i) => (
                <div key={i} className={`p-2 rounded-md ${t.role === "ai" ? "bg-primary/10" : t.role === "patient" ? "bg-wellness/10" : "bg-clinical/10"}`}>
                  <div className="text-[10px] uppercase tracking-wide font-semibold mb-0.5">{t.role}</div>
                  <div>{t.text}</div>
                </div>
              ))}
            </div>
          </Card>

          {soapNote && (
            <Card className="p-3">
              <div className="text-xs font-medium mb-2">AI Deputy SOAP note</div>
              <pre className="text-xs whitespace-pre-wrap font-sans">{soapNote}</pre>
              <Button onClick={() => navigate("/")} size="sm" className="mt-3 w-full">Close session</Button>
            </Card>
          )}
        </aside>
      </main>
    </div>
  );
};

export default CallRoom;