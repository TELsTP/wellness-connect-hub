import jsPDF from "jspdf";
import type { LiveVitalsSample } from "@/lib/vitals/bluetooth";
import type { SkinAssessment } from "@/lib/vitals/skin";
import { summarizeVitals, vitalsAlerts } from "@/lib/vitals/summary";
import type { StoredArtifact } from "@/lib/artifacts";

export interface TimelineInput {
  roomId: string;
  audience: "patient" | "doctor";
  startedAt: string;
  endedAt?: string;
  transcript: { role: string; text: string; ts: string }[];
  vitals: LiveVitalsSample[];
  skin?: SkinAssessment | null;
  triage?: string | null;
  soap?: string | null;
  artifacts?: StoredArtifact[];
}

const MARGIN = 14;

/** Builds the encounter timeline PDF and triggers the download. */
export function generateTimelinePdf(input: TimelineInput): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  let y = MARGIN;

  const ensure = (needed = 8) => {
    if (y + needed > H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const heading = (text: string) => {
    ensure(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 60, 90);
    doc.text(text, MARGIN, y);
    y += 5;
    doc.setDrawColor(200);
    doc.line(MARGIN, y, W - MARGIN, y);
    y += 5;
    doc.setTextColor(30);
  };

  const body = (text: string, size = 9, style: "normal" | "bold" = "normal") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    for (const line of doc.splitTextToSize(text, W - MARGIN * 2)) {
      ensure(6);
      doc.text(line, MARGIN, y);
      y += size * 0.48 + 1.2;
    }
  };

  // ---- Header
  doc.setFillColor(14, 60, 90);
  doc.rect(0, 0, W, 22, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("TELsTP · Telemedicine Encounter Timeline", MARGIN, 10);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${input.audience === "doctor" ? "Clinician copy" : "Patient copy"} · Room ${input.roomId}`,
    MARGIN,
    16,
  );
  doc.setTextColor(30);
  y = 30;

  body(
    `Started: ${new Date(input.startedAt).toLocaleString()}` +
      (input.endedAt ? `   |   Ended: ${new Date(input.endedAt).toLocaleString()}` : ""),
  );
  y += 3;

  // ---- Vitals
  const stats = summarizeVitals(input.vitals);
  heading("Measured vitals");
  if (!stats.length) {
    body("No vitals were captured during this encounter.");
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    ensure();
    doc.text("Metric", MARGIN, y);
    doc.text("Last", MARGIN + 55, y);
    doc.text("Min", MARGIN + 80, y);
    doc.text("Max", MARGIN + 100, y);
    doc.text("Mean", MARGIN + 120, y);
    doc.text("Status", MARGIN + 145, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    for (const s of stats) {
      ensure();
      doc.text(`${s.label} (${s.unit})`, MARGIN, y);
      doc.text(String(s.last), MARGIN + 55, y);
      doc.text(String(s.min), MARGIN + 80, y);
      doc.text(String(s.max), MARGIN + 100, y);
      doc.text(String(s.mean), MARGIN + 120, y);
      if (s.flag === "normal") doc.setTextColor(20, 120, 60);
      else doc.setTextColor(180, 40, 40);
      doc.text(s.flag.toUpperCase(), MARGIN + 145, y);
      doc.setTextColor(30);
      y += 5;
    }
    const alerts = vitalsAlerts(stats);
    if (alerts.length) {
      y += 2;
      body("Alerts:", 9, "bold");
      alerts.forEach((a) => body(`• ${a}`));
    }
  }
  y += 4;

  // ---- Skin / camera assessment
  if (input.skin) {
    heading("Camera-based facial assessment");
    const s = input.skin;
    body(
      `Frames analysed: ${s.frames} over ${s.durationSec}s (${s.fps} fps) · signal quality ${(s.quality * 100).toFixed(0)}%`,
    );
    body(`Skin tone (ITA°): ${s.ita} — ${s.toneLabel}`);
    body(`Wrinkle index: ${s.wrinkleIndex}/100`);
    body(`Erythema index: ${s.erythemaIndex}/100`);
    body(`Texture uniformity: ${s.uniformity}/100`);
    body(
      s.rppg
        ? `rPPG heart rate: ${s.rppg.bpm} bpm (SNR ${s.rppg.snr}, confidence ${(s.rppg.confidence * 100).toFixed(0)}%)`
        : "rPPG heart rate: not resolvable from this capture (insufficient signal).",
    );
    body("Screening indicators only — not a diagnostic measurement device.", 8);
    y += 4;
  }

  // ---- Triage
  if (input.triage) {
    heading("AI deputy triage assessment");
    body(input.triage);
    y += 4;
  }

  // ---- SOAP
  if (input.soap) {
    heading("SOAP note");
    body(input.soap);
    y += 4;
  }

  // ---- Transcript timeline
  heading("Conversation timeline");
  if (!input.transcript.length) body("No transcript recorded.");
  input.transcript.forEach((t) => {
    const time = t.ts ? new Date(t.ts).toLocaleTimeString() : "";
    body(`[${time}] ${t.role.toUpperCase()}: ${t.text}`);
  });
  y += 4;

  // ---- Artifacts
  if (input.artifacts?.length) {
    heading("Stored media artifacts");
    input.artifacts.forEach((a) => body(`• ${a.kind}: ${a.name}${a.size ? ` (${Math.round(a.size / 1024)} KB)` : ""}`));
  }

  // ---- Footer on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text(
      "TELsTP Co-Accreditation · AI Deputy encounter record · anonymous-first, no PHI identifiers stored",
      MARGIN,
      H - 8,
    );
    doc.text(`${p} / ${pages}`, W - MARGIN - 10, H - 8);
  }

  return doc;
}

export function downloadTimelinePdf(input: TimelineInput): Blob {
  const doc = generateTimelinePdf(input);
  doc.save(`encounter-${input.roomId}-${input.audience}.pdf`);
  return doc.output("blob");
}
