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
