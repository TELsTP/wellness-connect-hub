import type { LiveVitalsSample } from "@/lib/vitals/bluetooth";

export interface MetricStats {
  key: string;
  label: string;
  unit: string;
  n: number;
  min: number;
  max: number;
  mean: number;
  last: number;
  /** Normal adult resting reference range used for the flag. */
  ref: [number, number];
  flag: "low" | "normal" | "high";
}

const METRICS: { key: keyof LiveVitalsSample; label: string; unit: string; ref: [number, number] }[] = [
  { key: "heart_rate_bpm", label: "Heart rate", unit: "bpm", ref: [60, 100] },
  { key: "hrv_sdnn_ms", label: "HRV (SDNN)", unit: "ms", ref: [20, 200] },
  { key: "spo2_pct", label: "SpO₂", unit: "%", ref: [95, 100] },
  { key: "bp_systolic", label: "BP systolic", unit: "mmHg", ref: [90, 130] },
  { key: "bp_diastolic", label: "BP diastolic", unit: "mmHg", ref: [60, 85] },
  { key: "resp_rate_bpm", label: "Respiratory rate", unit: "/min", ref: [12, 20] },
];

export function summarizeVitals(samples: LiveVitalsSample[]): MetricStats[] {
  const out: MetricStats[] = [];
  for (const m of METRICS) {
    const values = samples
      .map((s) => s[m.key])
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    if (!values.length) continue;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const last = values[values.length - 1];
    const flag = last < m.ref[0] ? "low" : last > m.ref[1] ? "high" : "normal";
    out.push({
      key: String(m.key),
      label: m.label,
      unit: m.unit,
      n: values.length,
      min: round(min),
      max: round(max),
      mean: round(mean),
      last: round(last),
      ref: m.ref,
      flag,
    });
  }
  return out;
}

const round = (v: number) => Math.round(v * 10) / 10;

/** Deterministic clinical alerts derived from the measured values only. */
export function vitalsAlerts(stats: MetricStats[]): string[] {
  const by = (k: string) => stats.find((s) => s.key === k);
  const alerts: string[] = [];
  const hr = by("heart_rate_bpm");
  if (hr && hr.last > 120) alerts.push(`Tachycardia: HR ${hr.last} bpm (peak ${hr.max}).`);
  if (hr && hr.last < 50) alerts.push(`Bradycardia: HR ${hr.last} bpm (trough ${hr.min}).`);
  const spo2 = by("spo2_pct");
  if (spo2 && spo2.min < 92) alerts.push(`Hypoxaemia: SpO₂ dropped to ${spo2.min}%.`);
  const sys = by("bp_systolic");
  const dia = by("bp_diastolic");
  if (sys && sys.last >= 180) alerts.push(`Hypertensive range: systolic ${sys.last} mmHg.`);
  else if (sys && sys.last >= 140) alerts.push(`Elevated systolic ${sys.last} mmHg.`);
  if (sys && sys.last < 90) alerts.push(`Hypotension: systolic ${sys.last} mmHg.`);
  if (dia && dia.last >= 110) alerts.push(`Elevated diastolic ${dia.last} mmHg.`);
  const hrv = by("hrv_sdnn_ms");
  if (hrv && hrv.last < 20) alerts.push(`Low HRV (SDNN ${hrv.last} ms) — autonomic strain.`);
  return alerts;
}

export function vitalsToCsv(samples: LiveVitalsSample[]): string {
  const cols = [
    "captured_at", "source", "heart_rate_bpm", "hrv_sdnn_ms", "spo2_pct",
    "bp_systolic", "bp_diastolic", "resp_rate_bpm", "confidence",
  ];
  const rows = samples.map((s) =>
    [
      s.capturedAt,
      s.source,
      s.heart_rate_bpm ?? "",
      s.hrv_sdnn_ms != null ? Math.round(s.hrv_sdnn_ms) : "",
      s.spo2_pct ?? "",
      s.bp_systolic ?? "",
      s.bp_diastolic ?? "",
      s.resp_rate_bpm ?? "",
      s.confidence ?? "",
    ].join(","),
  );
  return [cols.join(","), ...rows].join("\n");
}

/** Compact, prompt-safe text block handed to the AI deputy for triage. */
export function vitalsBriefing(stats: MetricStats[]): string {
  if (!stats.length) return "Vitals: none captured.";
  return stats
    .map((s) => `${s.label}: last ${s.last}${s.unit} (min ${s.min}, max ${s.max}, mean ${s.mean}, n=${s.n}) — ${s.flag}`)
    .join("\n");
}
