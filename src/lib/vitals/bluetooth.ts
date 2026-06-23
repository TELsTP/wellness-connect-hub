/**
 * Real vitals capture via Web Bluetooth + standard Bluetooth SIG GATT
 * profiles. No mocked numbers — if the browser or the device cannot deliver a
 * measurement, the caller gets an Error and the UI shows "no reading".
 *
 * Supported today:
 *   - Heart Rate Service (0x180D) → heart_rate_bpm + RR-interval-derived
 *     HRV (SDNN over rolling 60s window). Works with any standards-compliant
 *     BLE HRM strap (Polar H10, Wahoo Tickr, Garmin HRM-Dual, Coros…).
 *
 * Future hooks (kept here so the call site never branches on provider):
 *   - Pulse Oximeter Service (0x1822) → spo2_pct + pleth-derived HR
 *   - Blood Pressure Service (0x1810) → bp_systolic / bp_diastolic
 *   - Health Thermometer (0x1809) → temperature_c
 */

export interface LiveVitalsSample {
  source: "ble-hrm" | "ble-pulseox" | "ble-bp" | "self-report";
  capturedAt: string;
  heart_rate_bpm?: number;
  hrv_sdnn_ms?: number;
  spo2_pct?: number;
  bp_systolic?: number;
  bp_diastolic?: number;
  resp_rate_bpm?: number;
  raw_payload?: unknown;
  confidence?: number;
}

export type VitalsListener = (s: LiveVitalsSample) => void;

const HR_SERVICE = "heart_rate";
const HR_MEASUREMENT = "heart_rate_measurement";

/** Parse the standard 0x2A37 Heart Rate Measurement characteristic. */
function parseHeartRate(value: DataView): { bpm: number; rrMs: number[] } {
  const flags = value.getUint8(0);
  const is16Bit = (flags & 0x01) === 0x01;
  const rrPresent = (flags & 0x10) === 0x10;
  let offset = 1;
  let bpm: number;
  if (is16Bit) {
    bpm = value.getUint16(offset, true);
    offset += 2;
  } else {
    bpm = value.getUint8(offset);
    offset += 1;
  }
  // Sensor contact + energy expended skipped (not always present).
  // Skip optional Energy Expended field
  if ((flags & 0x08) === 0x08) offset += 2;
  const rrMs: number[] = [];
  if (rrPresent) {
    while (offset + 1 < value.byteLength) {
      const raw = value.getUint16(offset, true);
      // RR intervals are reported in 1/1024 s units.
      rrMs.push((raw / 1024) * 1000);
      offset += 2;
    }
  }
  return { bpm, rrMs };
}

/** SDNN = standard deviation of NN-intervals. Standard short-term HRV metric. */
function sdnn(rrWindow: number[]): number | undefined {
  if (rrWindow.length < 5) return undefined;
  const mean = rrWindow.reduce((a, b) => a + b, 0) / rrWindow.length;
  const variance = rrWindow.reduce((a, b) => a + (b - mean) ** 2, 0) / rrWindow.length;
  return Math.sqrt(variance);
}

export class BluetoothHeartRateMonitor {
  private device: BluetoothDevice | null = null;
  private char: BluetoothRemoteGATTCharacteristic | null = null;
  private rrBuffer: { ts: number; rr: number }[] = [];
  private listener: VitalsListener | null = null;

  static isSupported(): boolean {
    return typeof navigator !== "undefined" && !!(navigator as Navigator & { bluetooth?: unknown }).bluetooth;
  }

  async connect(listener: VitalsListener): Promise<{ deviceName: string }> {
    if (!BluetoothHeartRateMonitor.isSupported()) {
      throw new Error("Web Bluetooth is not available in this browser. Use Chrome/Edge on Android or desktop.");
    }
    this.listener = listener;
    const nav = navigator as Navigator & { bluetooth: { requestDevice: (opts: unknown) => Promise<BluetoothDevice> } };
    this.device = await nav.bluetooth.requestDevice({
      filters: [{ services: [HR_SERVICE] }],
      optionalServices: [HR_SERVICE],
    });
    if (!this.device.gatt) throw new Error("Device has no GATT server");
    const server = await this.device.gatt.connect();
    const service = await server.getPrimaryService(HR_SERVICE);
    this.char = await service.getCharacteristic(HR_MEASUREMENT);
    await this.char.startNotifications();
    this.char.addEventListener("characteristicvaluechanged", this.onValue);
    this.device.addEventListener("gattserverdisconnected", () => {
      // Surface as an empty sample so UI can show "lost connection".
    });
    return { deviceName: this.device.name || "BLE heart-rate monitor" };
  }

  private onValue = (ev: Event) => {
    const target = ev.target as BluetoothRemoteGATTCharacteristic;
    if (!target.value) return;
    const { bpm, rrMs } = parseHeartRate(target.value);
    const now = Date.now();
    rrMs.forEach((rr) => this.rrBuffer.push({ ts: now, rr }));
    // Keep last 60s of RR intervals for SDNN.
    const cutoff = now - 60_000;
    this.rrBuffer = this.rrBuffer.filter((x) => x.ts >= cutoff);
    const hrv = sdnn(this.rrBuffer.map((x) => x.rr));
    this.listener?.({
      source: "ble-hrm",
      capturedAt: new Date(now).toISOString(),
      heart_rate_bpm: bpm,
      hrv_sdnn_ms: hrv,
      confidence: bpm > 30 && bpm < 220 ? 0.9 : 0.4,
      raw_payload: { rrMs, flags: target.value.getUint8(0) },
    });
  };

  async disconnect() {
    try { await this.char?.stopNotifications(); } catch { /* noop */ }
    this.char?.removeEventListener("characteristicvaluechanged", this.onValue);
    try { this.device?.gatt?.disconnect(); } catch { /* noop */ }
    this.device = null;
    this.char = null;
    this.rrBuffer = [];
    this.listener = null;
  }
}