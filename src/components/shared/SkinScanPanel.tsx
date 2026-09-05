import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScanFace, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { analyzeSkinFrame, aggregateAssessment, type SkinAssessment, type SkinFrameMetrics } from "@/lib/vitals/skin";
import { uploadArtifact, dataUrlToBlob } from "@/lib/artifacts";

interface Props {
  roomId: string;
  sessionId: string;
  /** Live camera stream from the call — reused so we don't open a 2nd camera. */
  stream: MediaStream | null;
  onResult?: (a: SkinAssessment) => void;
}

const DURATION_SEC = 20;
const ROI = 240; // square ROI in px sampled from the centre of the frame

/**
 * Camera-based facial assessment during the consult.
 * Samples the live video for 20s, measures every frame's pixels, then stores
 * the aggregate in `vitals_readings` and one reference frame in storage.
 * If no face / usable signal is found it says so — it never invents values.
 */
export const SkinScanPanel = ({ roomId, sessionId, stream, onResult }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SkinAssessment | null>(null);

  const runScan = async () => {
    if (!stream || !stream.getVideoTracks().length) {
      toast.error("Camera is not available for the scan.");
      return;
    }
    setRunning(true);
    setProgress(0);
    setResult(null);

    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play().catch(() => undefined);

    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvasRef.current = canvas;
    canvas.width = ROI;
    canvas.height = ROI;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) { setRunning(false); return; }

    const frames: SkinFrameMetrics[] = [];
    const start = performance.now();
    let firstFrameDataUrl: string | null = null;
    let faceMisses = 0;

    await new Promise<void>((resolve) => {
      const tick = () => {
        const elapsed = (performance.now() - start) / 1000;
        setProgress(Math.min(100, (elapsed / DURATION_SEC) * 100));
        const vw = video.videoWidth, vh = video.videoHeight;
        if (vw && vh) {
          // Centre-face ROI: middle 45% of the frame, where the face sits in a call.
          const side = Math.min(vw, vh) * 0.45;
          ctx.drawImage(video, (vw - side) / 2, vh * 0.18, side, side, 0, 0, ROI, ROI);
          try {
            frames.push(analyzeSkinFrame(ctx.getImageData(0, 0, ROI, ROI)));
            if (!firstFrameDataUrl && frames.length === 5) firstFrameDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          } catch {
            faceMisses++;
          }
        }
        if (elapsed >= DURATION_SEC) return resolve();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    video.pause();
    video.srcObject = null;

    try {
      if (frames.length < 30) {
        throw new Error(
          faceMisses > frames.length
            ? "No face detected — face the camera in even lighting and try again."
            : "Capture too short to analyse.",
        );
      }
      const assessment = aggregateAssessment(frames, DURATION_SEC);
      setResult(assessment);
      onResult?.(assessment);

      // Reference frame + raw assessment go to the artifact bucket for the clinician
      if (firstFrameDataUrl) await uploadArtifact(roomId, "frame", dataUrlToBlob(firstFrameDataUrl), "skin-roi");
      await uploadArtifact(
        roomId,
        "skin",
        new Blob([JSON.stringify(assessment, null, 2)], { type: "application/json" }),
        "assessment",
      );

      const { error } = await supabase.from("vitals_readings").insert({
        room_id: roomId,
        session_id: sessionId,
        captured_at: assessment.capturedAt,
        source: "camera-facial",
        skin_tone_ita: assessment.ita,
        wrinkle_score: assessment.wrinkleIndex,
        heart_rate_bpm: assessment.rppg?.bpm ?? null,
        confidence: assessment.rppg?.confidence ?? assessment.quality,
        raw_payload: assessment as never,
      });
      if (error) console.warn("skin assessment insert failed", error);
      toast.success("Facial assessment complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Assessment failed");
    } finally {
      setRunning(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium flex items-center gap-1"><ScanFace className="w-3.5 h-3.5" /> Facial scan (camera)</span>
        {result && <Badge variant="secondary" className="text-[10px]">quality {(result.quality * 100).toFixed(0)}%</Badge>}
      </div>

      {running ? (
        <div className="space-y-1">
          <Progress value={progress} className="h-1.5" />
          <p className="text-muted-foreground">Hold still, face the camera — {Math.ceil(DURATION_SEC - (progress / 100) * DURATION_SEC)}s left…</p>
        </div>
      ) : (
        <Button size="sm" onClick={runScan} disabled={!stream} className="w-full gap-1">
          {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <ScanFace className="w-3 h-3" />}
          Run 20-second facial scan
        </Button>
      )}

      {result && (
        <div className="grid grid-cols-2 gap-2">
          <Cell label="Skin tone (ITA°)" value={`${result.ita} · ${result.toneLabel}`} />
          <Cell label="Wrinkle index" value={`${result.wrinkleIndex}/100`} />
          <Cell label="Erythema" value={`${result.erythemaIndex}/100`} />
          <Cell label="Uniformity" value={`${result.uniformity}/100`} />
          <div className="col-span-2">
            <Cell
              label="rPPG heart rate"
              value={result.rppg ? `${result.rppg.bpm} bpm (conf ${(result.rppg.confidence * 100).toFixed(0)}%)` : "not resolvable"}
            />
          </div>
        </div>
      )}

      <p className="flex gap-1 text-[10px] text-muted-foreground">
        <Info className="w-3 h-3 shrink-0 mt-0.5" />
        Measured from your camera's pixels using open image-science methods (CIE Lab ITA°, Sobel texture energy,
        green-channel photoplethysmography). Screening indicators only — not a diagnostic device.
      </p>
    </div>
  );
};

const Cell = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border bg-muted/30 px-2 py-1">
    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="text-xs font-semibold">{value}</div>
  </div>
);

export default SkinScanPanel;
