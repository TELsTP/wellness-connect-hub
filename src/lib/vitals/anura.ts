/**
 * Anura / NuraLogix DeepAffex camera-based vitals adapter.
 *
 * STATUS: not yet wired. We're awaiting the SDK + sample payload from the
 * Anura developer team. The schema (table `vitals_readings`) and this
 * interface are intentionally aligned with the published DeepAffex output
 * so the only code change at integration time is filling in `captureVitals`.
 *
 * No mock numbers are returned anywhere — callers MUST handle
 * `NotConfiguredError` and surface a "vitals not configured" notice instead
 * of fake data.
 */

export interface VitalsReading {
  source: "anura" | "wearable" | "manual";
  capturedAt: string;
  confidence?: number;
  heart_rate_bpm?: number;
  hrv_sdnn_ms?: number;
  resp_rate_bpm?: number;
  spo2_pct?: number;
  bp_systolic?: number;
  bp_diastolic?: number;
  stress_index?: number;
  facial_age_estimate?: number;
  bmi_estimate?: number;
  hemoglobin_estimate?: number;
  skin_tone_ita?: number;
  wrinkle_score?: number;
  raw_payload?: unknown;
}

export class NotConfiguredError extends Error {
  constructor() {
    super("Anura vitals capture is not configured for this build.");
    this.name = "NotConfiguredError";
  }
}

/**
 * Will record N seconds of facial video via the user's camera and return a
 * VitalsReading from the Anura DeepAffex SDK. Until the SDK is delivered
 * this throws so the UI can show a real "coming soon" state.
 */
export async function captureVitals(_videoEl?: HTMLVideoElement, _seconds = 30): Promise<VitalsReading> {
  throw new NotConfiguredError();
}

export const VITALS_INTEGRATION_STATUS = {
  ready: false,
  provider: "Anura / NuraLogix DeepAffex",
  pendingItems: [
    "Commercial agreement signed",
    "SDK key delivered (ANURA_LICENSE_KEY secret)",
    "Sample payload reviewed and mapped to vitals_readings columns",
    "Wearable fallback channel (architect note — phase 2)",
  ],
} as const;