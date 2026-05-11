// Parses a resume file into plain text. Supports PDF, DOCX, TXT.
// Server-only.
import "server-only";

// Hard caps — must be aligned with next.config.mjs serverActions.bodySizeLimit (50MB total).
// A single resume should never realistically exceed 10MB.
const MAX_FILE_BYTES = 10 * 1024 * 1024;          // 10 MB
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];
const ALLOWED_MIME_PREFIXES = ["application/pdf", "application/vnd.openxmlformats", "text/"];

export async function fileToText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  // Size guard
  if (file.size === 0) {
    throw new Error("File is empty.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`File is too large. Max ${MAX_FILE_BYTES / (1024 * 1024)} MB.`);
  }

  // Extension + MIME whitelist
  const extOk  = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const mimeOk = ALLOWED_MIME_PREFIXES.some((m) => (file.type ?? "").startsWith(m));
  if (!extOk && !mimeOk) {
    throw new Error("Unsupported file type. Upload PDF, DOCX, or TXT.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".pdf")) {
    // pdf-parse exports a function, but its index file probes test PDFs at
    // import time. Import the lib path directly to avoid that.
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js"))
      .default as (b: Buffer) => Promise<{ text: string }>;
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }

  if (name.endsWith(".txt") || file.type.startsWith("text/")) {
    return buffer.toString("utf-8");
  }

  throw new Error("Unsupported file type. Upload PDF, DOCX, or TXT.");
}
