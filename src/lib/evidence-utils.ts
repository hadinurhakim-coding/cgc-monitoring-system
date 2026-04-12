// Format di DB: "teks evidence user\n[FILE:storage/path.ext|NamaAsli.ext]"
const FILE_MARKER_RE = /\[FILE:(.*?)(?:\|(.*?))?\]/g;

/** Ambil hanya teks user (tanpa marker [FILE:...]) untuk ditampilkan di textarea. */
export function extractEvidenceText(evidence: string | null | undefined): string {
  if (!evidence) return "";
  return evidence
    .replace(new RegExp(FILE_MARKER_RE.source, "g"), "")
    .replace(/\n+$/, "")
    .trim();
}

/** Parse semua file markers dari evidence string. */
export function extractEvidenceFiles(
  evidence: string | null | undefined,
): Array<{ path: string; name: string }> {
  if (!evidence) return [];
  const files: Array<{ path: string; name: string }> = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(FILE_MARKER_RE.source, "g");
  while ((match = re.exec(evidence)) !== null) {
    files.push({ path: match[1], name: match[2] || "File" });
  }
  return files;
}

/** Gabung kembali teks user + file markers menjadi satu string evidence untuk di-save. */
export function reconstructEvidence(
  text: string,
  files: Array<{ path: string; name: string }>,
): string {
  const markers = files.map((f) => `[FILE:${f.path}|${f.name}]`).join("\n");
  const trimmed = text.trim();
  if (trimmed && markers) return trimmed + "\n" + markers;
  return trimmed || markers;
}

/** URL regex untuk mendeteksi link dalam teks. */
const URL_RE = /https?:\/\/[^\s]+/g;

export type EvidenceTextSegment =
  | { type: "text"; value: string }
  | { type: "url"; value: string };

/**
 * Ubah teks evidence (plain) menjadi array segmen: teks biasa dan URL.
 * Berguna untuk render teks yang mengandung link menjadi elemen <a> yang bisa diklik.
 */
export function parseEvidenceTextSegments(text: string): EvidenceTextSegment[] {
  const segments: EvidenceTextSegment[] = [];
  let lastIndex = 0;
  URL_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = URL_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "url", value: match[0] });
    lastIndex = URL_RE.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }
  return segments;
}
