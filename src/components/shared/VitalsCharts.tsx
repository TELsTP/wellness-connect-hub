import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, TriangleAlert } from "lucide-react";
import type { LiveVitalsSample } from "@/lib/vitals/bluetooth";
import { summarizeVitals, vitalsAlerts, vitalsToCsv } from "@/lib/vitals/summary";

interface Props {
  samples: LiveVitalsSample[];
  roomId: string;
}

const SERIES: { key: keyof LiveVitalsSample; label: string; unit: string; color: string; ref: [number, number] }[] = [
  { key: "heart_rate_bpm", label: "Heart rate", unit: "bpm", color: "hsl(var(--destructive))", ref: [60, 100] },
  { key: "hrv_sdnn_ms", label: "HRV (SDNN)", unit: "ms", color: "hsl(var(--primary))", ref: [20, 200] },
  { key: "spo2_pct", label: "SpO₂", unit: "%", color: "hsl(var(--success, var(--primary)))", ref: [95, 100] },
  { key: "bp_systolic", label: "BP systolic", unit: "mmHg", color: "hsl(var(--accent-foreground))", ref: [90, 130] },
];

/**
 * Real-time trend charts + clinician summary for the live consult.
 * Renders only the metrics that actually have measurements — nothing is
 * synthesised when a sensor is absent.
 */
export const VitalsCharts = ({ samples, roomId }: Props) => {
  const stats = useMemo(() => summarizeVitals(samples), [samples]);
  const alerts = useMemo(() => vitalsAlerts(stats), [stats]);

  const data = useMemo(
    () =>
      samples.map((s) => ({
        t: new Date(s.capturedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        heart_rate_bpm: s.heart_rate_bpm,
        hrv_sdnn_ms: s.hrv_sdnn_ms != null ? Math.round(s.hrv_sdnn_ms) : undefined,
        spo2_pct: s.spo2_pct,
        bp_systolic: s.bp_systolic,
      })),
    [samples],
  );

  const active = SERIES.filter((s) => samples.some((x) => typeof x[s.key] === "number"));

  const exportCsv = () => {
    const blob = new Blob([vitalsToCsv(samples)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vitals-${roomId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!samples.length) {
    return <p className="text-xs text-muted-foreground italic">No vitals recorded yet — pair a sensor or run a camera scan.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium">Vitals trend · {samples.length} samples</span>
        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={exportCsv}>
          <Download className="w-3 h-3" /> CSV
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {active.map((s) => (
          <div key={String(s.key)} className="rounded-lg border p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium">{s.label}</span>
              <span className="text-[10px] text-muted-foreground">{s.unit}</span>
            </div>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 4, right: 6, bottom: 0, left: -22 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="t" tick={{ fontSize: 8 }} interval="preserveStartEnd" minTickGap={24} />
                  <YAxis tick={{ fontSize: 8 }} domain={["auto", "auto"]} width={34} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <ReferenceArea y1={s.ref[0]} y2={s.ref[1]} fill={s.color} fillOpacity={0.07} />
                  <Line
                    type="monotone"
                    dataKey={String(s.key)}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border">
        <div className="px-2 py-1.5 text-[11px] font-medium border-b">Clinician summary</div>
        <table className="w-full text-[11px]">
          <thead className="text-muted-foreground">
            <tr>
              <th className="text-start px-2 py-1 font-medium">Metric</th>
              <th className="px-1 font-medium">Last</th>
              <th className="px-1 font-medium">Min</th>
              <th className="px-1 font-medium">Max</th>
              <th className="px-1 font-medium">Mean</th>
              <th className="px-1 font-medium">Ref</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.key} className="border-t">
                <td className="px-2 py-1">{s.label}</td>
                <td className="px-1 text-center font-semibold">
                  <span className={s.flag === "normal" ? "" : "text-destructive"}>{s.last}</span>
                </td>
                <td className="px-1 text-center">{s.min}</td>
                <td className="px-1 text-center">{s.max}</td>
                <td className="px-1 text-center">{s.mean}</td>
                <td className="px-1 text-center text-muted-foreground">{s.ref[0]}–{s.ref[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {alerts.length > 0 && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-2 space-y-1">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-destructive">
            <TriangleAlert className="w-3 h-3" /> Clinical alerts
          </div>
          {alerts.map((a) => (
            <div key={a} className="text-[11px]">{a}</div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        {Array.from(new Set(samples.map((s) => s.source))).map((src) => (
          <Badge key={src} variant="secondary" className="text-[10px]">{src}</Badge>
        ))}
      </div>
    </div>
  );
};

export default VitalsCharts;
