const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "file"; file: { filename: string; file_data: string } };

/**
 * Convert browser File objects to OpenAI-compatible multimodal content parts.
 * - Images -> image_url (data URL)
 * - PDFs   -> file (data URL)
 * - Audio/other -> ignored with a text note (audio webm/m4a is not supported by the gateway path)
 */
export async function filesToContentParts(files: File[]): Promise<ContentPart[]> {
  const parts: ContentPart[] = [];
  for (const f of files) {
    try {
      const dataUrl = await fileToDataUrl(f);
      if (f.type.startsWith("image/")) {
        parts.push({ type: "image_url", image_url: { url: dataUrl } });
      } else if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) {
        parts.push({
          type: "file",
          file: { filename: f.name || "document.pdf", file_data: dataUrl },
        });
      } else {
        parts.push({ type: "text", text: `[Attached file "${f.name}" (${f.type || "unknown type"}) — content not directly readable.]` });
      }
    } catch (e) {
      console.error("Failed to read file", f.name, e);
    }
  }
  return parts;
}