import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Activity, Bluetooth, Heart, Loader2, NotebookPen } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BluetoothHeartRateMonitor, type LiveVitalsSample } from "@/lib/vitals/bluetooth";

interface Props {
  roomId: string;
  sessionId: string;
  /** When set, panel is read-only and just renders incoming samples (clinician view). */
  readOnly?: boolean;
}

/**
 * Real, no-mocks vitals capture for the live consult.
 * Patient side: pairs a BLE heart-rate strap and/or enters self-reported
 * cuff readings. Every sample is written to `vitals_readings` (RLS-scoped
 * by session) AND broadcast on the call channel so the clinician sees it
 * live without polling.
 */
export const VitalsPanel = ({ roomId, sessionId, readOnly }: Props) => {
  const monitorRef = useRef<BluetoothHeartRateMonitor | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [latest, setLatest] = useState<LiveVitalsSample | null>(null);
  const [history, setHistory] = useState<LiveVitalsSample[]>([]);
  const [manual, setManual] = useState({ sys: "", dia: "", temp: "", spo2: "" });
  const [saving, setSaving] = useState(false);

  const ingest = (s: LiveVitalsSample) => {
    setLatest(s);
    setHistory((h) => [...h.slice(-59), s]);
  };

  // Clinician (read-only) subscribes to broadcast samples from the patient
  useEffect(() => {
    if (!readOnly) return;
    const ch = supabase
      .channel(`vitals:${roomId}`)
      .on("broadcast", { event: "sample" }, (msg) => {
        const s = msg.payload as LiveVitalsSample;
        if (s) ingest(s);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [readOnly, roomId]);

  const broadcastRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  useEffect(() => {
    if (readOnly) return;
    const ch = supabase.channel(`vitals:${roomId}`);
    ch.subscribe();
    broadcastRef.current = ch;
    return () => { supabase.removeChannel(ch); broadcastRef.current = null; };
  }, [readOnly, roomId]);

  const persist = async (s: LiveVitalsSample) => {
    const { error } = await supabase.from("vitals_readings").insert({
      room_id: roomId,
      session_id: sessionId,
      captured_at: s.capturedAt,
      source: s.source,
      heart_rate_bpm: s.heart_rate_bpm ?? null,
      hrv_sdnn_ms: s.hrv_sdnn_ms ?? null,
      spo2_pct: s.spo2_pct ?? null,
      bp_systolic: s.bp_systolic ?? null,
      bp_diastolic: s.bp_diastolic ?? null,
      resp_rate_bpm: s.resp_rate_bpm ?? null,
      confidence: s.confidence ?? null,
      raw_payload: (s.raw_payload as never) ?? null,
    });
    if (error) console.warn("vitals insert failed", error);
    broadcastRef.current?.send({ type: "broadcast", event: "sample", payload: s });
  };

  // Throttle BLE persistence: store at most one row every 5 s, broadcast every sample
  const lastSavedRef = useRef(0);
  const onBleSample = (s: LiveVitalsSample) => {
    ingest(s);
    broadcastRef.current?.send({ type: "broadcast", event: "sample", payload: s });
    const now = Date.now();
    if (now - lastSavedRef.current > 5000) {
      lastSavedRef.current = now;
      void persist(s);
    }
  };

  const connectBle = async () => {
    setConnecting(true);
    try {
      const mon = new BluetoothHeartRateMonitor();
      const { deviceName: name } = await mon.connect(onBleSample);
      monitorRef.current = mon;
      setDeviceName(name);
      toast.success(`Paired with ${name}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Pairing failed";
      toast.error(msg);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectBle = async () => {
    await monitorRef.current?.disconnect();
    monitorRef.current = null;
    setDeviceName(null);
  };

  useEffect(() => () => { void monitorRef.current?.disconnect(); }, []);

  const submitManual = async () => {
    const sys = manual.sys ? Number(manual.sys) : undefined;
    const dia = manual.dia ? Number(manual.dia) : undefined;
    const spo2 = manual.spo2 ? Number(manual.spo2) : undefined;
    const temp = manual.temp ? Number(manual.temp) : undefined;
    if (sys === undefined && dia === undefined && spo2 === undefined && temp === undefined) {
      toast.info("Enter at least one reading");
      return;
    }
    setSaving(true);
    try {
      const sample: LiveVitalsSample = {
        source: "self-report",
        capturedAt: new Date().toISOString(),
        bp_systolic: sys,
        bp_diastolic: dia,
        spo2_pct: spo2,
        confidence: 0.5,
        raw_payload: { temperature_c: temp, entered_by: "patient" },
      };
      await persist(sample);
      ingest(sample);
      setManual({ sys: "", dia: "", temp: "", spo2: "" });
      toast.success("Reading saved");
    } finally {
      setSaving(false);
    }
  };

  const supported = BluetoothHeartRateMonitor.isSupported();

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center gap-2 font-medium">
        <Activity className="w-3.5 h-3.5" /> Vitals (live)
      </div>

      {latest ? (
        <div className="grid grid-cols-2 gap-2">
          <Metric label="HR" value={latest.heart_rate_bpm} unit="bpm" />
          <Metric label="HRV" value={latest.hrv_sdnn_ms ? Math.round(latest.hrv_sdnn_ms) : undefined} unit="ms" />
          <Metric label="SpO₂" value={latest.spo2_pct} unit="%" />
          <Metric label="BP" value={latest.bp_systolic && latest.bp_diastolic ? `${latest.bp_systolic}/${latest.bp_diastolic}` : undefined} unit="mmHg" />
        </div>
      ) : (
        <p className="text-muted-foreground italic">No readings yet.</p>
      )}

      {!readOnly && (
        <>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium flex items-center gap-1"><Heart className="w-3 h-3" /> BLE heart-rate strap</span>
              {deviceName && <Badge variant="secondary" className="text-[10px]">{deviceName}</Badge>}
            </div>
            {!supported ? (
              <p className="text-muted-foreground">Web Bluetooth isn't available in this browser. Use Chrome or Edge.</p>
            ) : deviceName ? (
              <Button size="sm" variant="outline" onClick={disconnectBle} className="w-full">Disconnect sensor</Button>
            ) : (
              <Button size="sm" onClick={connectBle} disabled={connecting} className="w-full gap-1">
                {connecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bluetooth className="w-3 h-3" />}
                Pair sensor (Polar / Wahoo / Garmin)
              </Button>
            )}
          </div>

          <div className="space-y-1 pt-2 border-t">
            <div className="font-medium flex items-center gap-1"><NotebookPen className="w-3 h-3" /> Self-reported (cuff / oximeter)</div>
            <div className="grid grid-cols-2 gap-1">
              <Field label="Systolic" v={manual.sys} on={(v) => setManual((m) => ({ ...m, sys: v }))} />
              <Field label="Diastolic" v={manual.dia} on={(v) => setManual((m) => ({ ...m, dia: v }))} />
              <Field label="SpO₂ %" v={manual.spo2} on={(v) => setManual((m) => ({ ...m, spo2: v }))} />
              <Field label="Temp °C" v={manual.temp} on={(v) => setManual((m) => ({ ...m, temp: v }))} />
            </div>
            <Button size="sm" onClick={submitManual} disabled={saving} className="w-full mt-1">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save reading"}
            </Button>
          </div>
        </>
      )}

      {history.length > 0 && (
        <details className="pt-2 border-t">
          <summary className="cursor-pointer text-muted-foreground">History ({history.length})</summary>
          <div className="mt-1 max-h-40 overflow-y-auto space-y-0.5 font-mono text-[10px]">
            {history.slice().reverse().map((s, i) => (
              <div key={i} className="flex justify-between gap-2">
                <span>{new Date(s.capturedAt).toLocaleTimeString()}</span>
                <span className="text-muted-foreground">{s.source}</span>
                <span>{s.heart_rate_bpm ?? "—"} bpm</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

const Metric = ({ label, value, unit }: { label: string; value?: number | string; unit: string }) => (
  <div className="rounded-md border bg-muted/30 px-2 py-1">
    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="text-sm font-semibold">{value ?? "—"} <span className="text-[10px] font-normal text-muted-foreground">{value !== undefined ? unit : ""}</span></div>
  </div>
);

const Field = ({ label, v, on }: { label: string; v: string; on: (v: string) => void }) => (
  <div>
    <Label className="text-[10px]">{label}</Label>
    <Input value={v} onChange={(e) => on(e.target.value)} inputMode="decimal" className="h-7 text-xs" />
  </div>
);

export default VitalsPanel;