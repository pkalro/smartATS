// Parses a resume file into plain text. Supports PDF, DOCX, TXT.
// Server-only.
import "server-only";

export async function fileToText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
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
