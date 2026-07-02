import { browser } from "$app/environment";
import { resolve } from "$app/paths";

const MAX_EVIDENCE_BYTES = 15 * 1024 * 1024;
const ALLOWED_FILETYPE_EXTS = new Set(["pdf", "png", "jpg", "jpeg", "webp"]);
const ALLOWED_MIME_BY_EXT: Record<string, string> = {
	pdf: "application/pdf",
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	webp: "image/webp"
};

export type UploadedEvidenceFile = {
	path: string;
	name: string;
	downloadUrl: string;
};

export async function saveAssessmentField(
	row_uid: string,
	field: string,
	value: string
): Promise<{ error: Error | null }> {
	const res = await fetch(resolve("/assessment-acgs/api/save"), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ row_uid, field, value })
	});
	if (!res.ok) {
		let msg = res.statusText;
		try {
			const j = await res.json();
			if (typeof j?.message === "string") msg = j.message;
		} catch {
			const t = await res.text();
			if (t) msg = t;
		}
		return { error: new Error(msg) };
	}
	return { error: null };
}

/**
 * Unggah bukti lewat URL tanda tangan server, lalu kembalikan URL unduhan same-origin (bucket privat).
 */
export async function uploadEvidenceWithSignedUrl(
	file: File,
	opts: { year: number; questionCode: string }
): Promise<{ data: UploadedEvidenceFile | null; error: Error | null }> {
	const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
	const fileType = file.type || "application/octet-stream";

	if (file.size <= 0 || file.size > MAX_EVIDENCE_BYTES) {
		return { data: null, error: new Error("Ukuran file bukti maksimal 15 MB.") };
	}
	if (!ALLOWED_FILETYPE_EXTS.has(ext)) {
		return { data: null, error: new Error("Ekstensi file tidak didukung. Unggah PDF, JPG, PNG, atau WEBP.") };
	}
	if (fileType.toLowerCase() !== ALLOWED_MIME_BY_EXT[ext]) {
		return { data: null, error: new Error("Tipe file tidak sesuai dengan ekstensi.") };
	}

	const metaRes = await fetch(resolve("/assessment-acgs/api/upload-url"), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({
			fileName: file.name,
			fileSize: file.size,
			fileType,
			year: opts.year,
			questionCode: opts.questionCode,
			ext
		})
	});

	if (!metaRes.ok) {
		const t = await metaRes.text();
		return { data: null, error: new Error(t || metaRes.statusText) };
	}

	const { signedUrl, path } = (await metaRes.json()) as { signedUrl?: string; path?: string };
	if (!signedUrl || !path) {
		return { data: null, error: new Error("Respons server tidak valid") };
	}

	const put = await fetch(signedUrl, {
		method: "PUT",
		body: file,
		headers: { "Content-Type": fileType }
	});
	if (!put.ok) {
		return { data: null, error: new Error("Gagal mengunggah file ke penyimpanan") };
	}

	const verifyRes = await fetch(resolve("/assessment-acgs/api/verify-upload"), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({
			path,
			fileName: file.name,
			fileSize: file.size,
			fileType,
			year: opts.year,
			questionCode: opts.questionCode,
			ext
		})
	});

	if (!verifyRes.ok) {
		const t = await verifyRes.text();
		return { data: null, error: new Error(t || "File bukti tidak lolos validasi server") };
	}

	const origin = browser ? window.location.origin : "";
	const downloadUrl = `${origin}${resolve("/assessment-acgs/api/download")}?path=${encodeURIComponent(path)}`;
	return {
		data: {
			path,
			name: file.name,
			downloadUrl
		},
		error: null
	};
}

/**
 * Hapus objek secara fisik dari penyimpanan (bucket) server.
 */
export async function deleteEvidenceFile(path: string): Promise<{ error: Error | null }> {
	const res = await fetch(resolve("/assessment-acgs/api/delete-file"), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ path })
	});
	if (!res.ok) {
		const t = await res.text();
		return { error: new Error(t || "Gagal menghapus file dari storage") };
	}
	return { error: null };
}
