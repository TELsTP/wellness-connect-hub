import { supabase } from "@/integrations/supabase/client";

export const ARTIFACT_BUCKET = "call-artifacts";

export type ArtifactKind = "frame" | "audio" | "recording" | "skin" | "report";

export interface StoredArtifact {
  kind: ArtifactKind;
  path: string;
  name: string;
  size: number;
  createdAt: string;
}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "audio/webm": "webm",
  "audio/mp4": "m4a",
  "video/webm": "webm",
  "video/mp4": "mp4",
  "application/json": "json",
  "application/pdf": "pdf",
  "text/csv": "csv",
};

function extFor(blob: Blob, fallback = "bin") {
  const base = (blob.type || "").split(";")[0];
  return EXT[base] || fallback;
}

/** Upload one call artifact. Returns the storage path, or null on failure. */
export async function uploadArtifact(
  roomId: string,
  kind: ArtifactKind,
  blob: Blob,
  label?: string,
): Promise<string | null> {
  if (!roomId || !blob.size) return null;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = `${roomId}/${kind}/${label ? `${label}-` : ""}${stamp}.${extFor(blob)}`;
  const { error } = await supabase.storage
    .from(ARTIFACT_BUCKET)
    .upload(path, blob, { contentType: blob.type || "application/octet-stream", upsert: true });
  if (error) {
    console.warn("artifact upload failed", kind, error.message);
    return null;
  }
  return path;
}

export async function listArtifacts(roomId: string): Promise<StoredArtifact[]> {
  const kinds: ArtifactKind[] = ["frame", "audio", "recording", "skin", "report"];
  const results = await Promise.all(
    kinds.map(async (kind) => {
      const { data, error } = await supabase.storage
        .from(ARTIFACT_BUCKET)
        .list(`${roomId}/${kind}`, { limit: 200, sortBy: { column: "name", order: "asc" } });
      if (error || !data) return [];
      return data
        .filter((f) => f.name && f.id !== null)
        .map<StoredArtifact>((f) => ({
          kind,
          path: `${roomId}/${kind}/${f.name}`,
          name: f.name,
          size: (f.metadata as { size?: number } | null)?.size ?? 0,
          createdAt: f.created_at ?? "",
        }));
    }),
  );
  return results.flat();
}

/** Time-limited link so the clinician can open an artifact from the report. */
export async function signedArtifactUrl(path: string, expiresIn = 60 * 60 * 24 * 7): Promise<string | null> {
  const { data, error } = await supabase.storage.from(ARTIFACT_BUCKET).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(meta)?.[1] || "image/jpeg";
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return new Blob([buf], { type: mime });
}
