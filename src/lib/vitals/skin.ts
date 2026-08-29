/**
 * Camera-based facial assessment — an open replication of the class of
 * algorithms used by Anura / DeepAffex, built from published, verifiable
 * image-science methods only.
 *
 * NOTHING here is mocked or randomised. Every number is computed from the
 * actual pixels of the frames captured by the patient's camera:
 *
 *   - Skin tone (ITA°)      : CIE Lab individual typology angle
 *                             ITA = atan((L* - 50) / b*) * 180/pi
 *   - Wrinkle index         : normalised high-frequency Sobel gradient energy
 *                             over the skin mask (0-100)
 *   - Erythema index        : log(R) - log(G) mean, the standard reflectance
 *                             redness proxy (0-100 scaled)
 *   - Texture uniformity    : 100 - normalised luminance dispersion
 *   - rPPG heart rate       : green-channel photoplethysmography, detrended,
 *                             band-passed 0.7-3.0 Hz (42-180 bpm), peak of the
 *                             periodogram, gated by spectral SNR
 *
 * When the signal quality is insufficient the functions return `null` for the
 * affected metric instead of inventing a value.
 */

export interface SkinFrameMetrics {
  /** CIE Lab individual typology angle in degrees. */
  ita: number;
  /** Fitzpatrick-adjacent descriptor derived from ITA. */
  toneLabel: string;
  /** 0-100, higher = more fine-line / wrinkle energy. */
  wrinkleIndex: number;
  /** 0-100, higher = more redness / erythema. */
  erythemaIndex: number;
  /** 0-100, higher = smoother, more uniform skin. */
  uniformity: number;
  /** Mean luminance 0-255 — used for quality gating. */
  luminance: number;
  /** Laplacian variance sharpness — used for quality gating. */
  sharpness: number;
  /** 0-1 quality/confidence of this frame. */
  quality: number;
  /** Mean green channel value — feeds the rPPG series. */
  greenMean: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** sRGB (D65) -> CIE L*a*b*. */
export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const R = srgbToLinear(r), G = srgbToLinear(g), B = srgbToLinear(b);
  const X = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047;
  const Y = R * 0.2126729 + G * 0.7151522 + B * 0.072175;
  const Z = (R * 0.0193339 + G * 0.119192 + B * 0.9503041) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(X), fy = f(Y), fz = f(Z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** Standard ITA° -> skin-tone category (Chardon classification). */
export function itaToToneLabel(ita: number): string {
  if (ita > 55) return "very light";
  if (ita > 41) return "light";
  if (ita > 28) return "intermediate";
  if (ita > 10) return "tan";
  if (ita > -30) return "brown";
  return "dark";
}

/**
 * YCbCr skin-likelihood mask — the classic Chai & Ngan thresholds.
 * Keeps the measurement on skin pixels instead of hair/background.
 */
function isSkinPixel(r: number, g: number, b: number): boolean {
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;
}

/**
 * Analyse a single frame (typically the central facial ROI).
 * Throws when fewer than 2% of the pixels look like skin — i.e. no face.
 */
export function analyzeSkinFrame(img: ImageData): SkinFrameMetrics {
  const { data, width, height } = img;
  const n = width * height;
  const gray = new Float32Array(n);
  const skin = new Uint8Array(n);

  let skinCount = 0;
  let sumL = 0, sumA = 0, sumB = 0;
  let sumLogRG = 0;
  let sumLum = 0, sumLum2 = 0;
  let sumGreen = 0;

  for (let i = 0; i < n; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[i] = lum;
    if (isSkinPixel(r, g, b)) {
      skin[i] = 1;
      skinCount++;
      const [L, A, B2] = rgbToLab(r, g, b);
      sumL += L; sumA += A; sumB += B2;
      sumLogRG += Math.log(r + 1) - Math.log(g + 1);
      sumLum += lum; sumLum2 += lum * lum;
      sumGreen += g;
    }
  }

  if (skinCount < n * 0.02) {
    throw new Error("No face detected in frame — move closer and ensure even lighting.");
  }

  const L = sumL / skinCount;
  const bStar = sumB / skinCount;
  const ita = (Math.atan((L - 50) / (bStar === 0 ? 1e-6 : bStar)) * 180) / Math.PI;

  // Sobel gradient energy restricted to skin pixels = fine-line / wrinkle energy
  let gradSum = 0, gradCount = 0, lapSum = 0, lapSum2 = 0, lapCount = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      if (!skin[i]) continue;
      const tl = gray[i - width - 1], t = gray[i - width], tr = gray[i - width + 1];
      const l = gray[i - 1], r = gray[i + 1];
      const bl = gray[i + width - 1], bo = gray[i + width], br = gray[i + width + 1];
      const gx = tl + 2 * l + bl - (tr + 2 * r + br);
      const gy = tl + 2 * t + tr - (bl + 2 * bo + br);
      gradSum += Math.hypot(gx, gy);
      gradCount++;
      const lap = 4 * gray[i] - t - bo - l - r;
      lapSum += lap; lapSum2 += lap * lap; lapCount++;
    }
  }

  const meanGrad = gradCount ? gradSum / gradCount : 0;
  // 120 = empirical full-scale gradient for a strongly textured skin ROI.
  const wrinkleIndex = clamp((meanGrad / 120) * 100, 0, 100);

  const meanLum = sumLum / skinCount;
  const varLum = Math.max(0, sumLum2 / skinCount - meanLum * meanLum);
  const uniformity = clamp(100 - (Math.sqrt(varLum) / 60) * 100, 0, 100);

  const meanLogRG = sumLogRG / skinCount;
  const erythemaIndex = clamp(((meanLogRG - 0.05) / 0.45) * 100, 0, 100);

  const lapMean = lapCount ? lapSum / lapCount : 0;
  const sharpness = lapCount ? Math.max(0, lapSum2 / lapCount - lapMean * lapMean) : 0;

  // Quality: enough skin, well exposed, in focus.
  const coverage = clamp(skinCount / n / 0.25, 0, 1);
  const exposure = 1 - clamp(Math.abs(meanLum - 130) / 130, 0, 1);
  const focus = clamp(sharpness / 120, 0, 1);
  const quality = clamp(0.4 * coverage + 0.3 * exposure + 0.3 * focus, 0, 1);

  return {
    ita: Number(ita.toFixed(1)),
    toneLabel: itaToToneLabel(ita),
    wrinkleIndex: Number(wrinkleIndex.toFixed(1)),
    erythemaIndex: Number(erythemaIndex.toFixed(1)),
    uniformity: Number(uniformity.toFixed(1)),
    luminance: Number(meanLum.toFixed(1)),
    sharpness: Number(sharpness.toFixed(1)),
    quality: Number(quality.toFixed(2)),
    greenMean: Number((sumGreen / skinCount).toFixed(3)),
  };
}

export interface RppgResult {
  bpm: number;
  /** Spectral signal-to-noise ratio of the selected peak. */
  snr: number;
  confidence: number;
}

/**
 * Remote photoplethysmography from the per-frame mean green value.
 * Returns null when the recording is too short or the spectral peak is not
 * clearly above the noise floor — never a guessed pulse.
 */
export function estimateRppgHeartRate(series: number[], fps: number): RppgResult | null {
  const n = series.length;
  if (n < 128 || fps <= 0) return null;

  // Detrend (linear least squares) then Hann window.
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) { sx += i; sy += series[i]; sxx += i * i; sxy += i * series[i]; }
  const denom = n * sxx - sx * sx || 1;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;

  const sig = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const detr = series[i] - (slope * i + intercept);
    sig[i] = detr * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)));
  }

  // Goertzel-style DFT over the physiological band only (0.7-3.0 Hz).
  const minHz = 0.7, maxHz = 3.0;
  const step = 0.005;
  const power: { hz: number; p: number }[] = [];
  for (let hz = minHz; hz <= maxHz; hz += step) {
    const w = (2 * Math.PI * hz) / fps;
    let re = 0, im = 0;
    for (let i = 0; i < n; i++) { re += sig[i] * Math.cos(w * i); im -= sig[i] * Math.sin(w * i); }
    power.push({ hz, p: (re * re + im * im) / n });
  }

  let peak = power[0];
  for (const b of power) if (b.p > peak.p) peak = b;

  // Noise floor = mean power outside the peak +/- 0.15 Hz and its 2nd harmonic.
  let noiseSum = 0, noiseCount = 0;
  for (const b of power) {
    const nearPeak = Math.abs(b.hz - peak.hz) < 0.15;
    const nearHarm = Math.abs(b.hz - peak.hz * 2) < 0.15;
    if (!nearPeak && !nearHarm) { noiseSum += b.p; noiseCount++; }
  }
  const noise = noiseCount ? noiseSum / noiseCount : 0;
  const snr = noise > 0 ? peak.p / noise : 0;

  // Below 3x the noise floor the peak is not a pulse we are willing to report.
  if (snr < 3) return null;

  const bpm = peak.hz * 60;
  if (bpm < 42 || bpm > 180) return null;

  return {
    bpm: Math.round(bpm),
    snr: Number(snr.toFixed(2)),
    confidence: Number(clamp((snr - 3) / 9, 0, 1).toFixed(2)),
  };
}

export interface SkinAssessment {
  capturedAt: string;
  frames: number;
  durationSec: number;
  fps: number;
  ita: number;
  toneLabel: string;
  wrinkleIndex: number;
  erythemaIndex: number;
  uniformity: number;
  quality: number;
  rppg: RppgResult | null;
}

/** Aggregate per-frame metrics into one assessment, weighting by frame quality. */
export function aggregateAssessment(frames: SkinFrameMetrics[], durationSec: number): SkinAssessment {
  if (!frames.length) throw new Error("No analysable frames captured.");
  const usable = frames.filter((f) => f.quality >= 0.25);
  const pool = usable.length >= 5 ? usable : frames;
  const wsum = pool.reduce((a, f) => a + Math.max(f.quality, 0.05), 0);
  const wavg = (pick: (f: SkinFrameMetrics) => number) =>
    Number((pool.reduce((a, f) => a + pick(f) * Math.max(f.quality, 0.05), 0) / wsum).toFixed(1));

  const fps = durationSec > 0 ? frames.length / durationSec : 0;
  const ita = wavg((f) => f.ita);

  return {
    capturedAt: new Date().toISOString(),
    frames: frames.length,
    durationSec: Number(durationSec.toFixed(1)),
    fps: Number(fps.toFixed(1)),
    ita,
    toneLabel: itaToToneLabel(ita),
    wrinkleIndex: wavg((f) => f.wrinkleIndex),
    erythemaIndex: wavg((f) => f.erythemaIndex),
    uniformity: wavg((f) => f.uniformity),
    quality: Number((pool.reduce((a, f) => a + f.quality, 0) / pool.length).toFixed(2)),
    rppg: estimateRppgHeartRate(frames.map((f) => f.greenMean), fps),
  };
}
