export type AoiSaveFieldPayload = {
	uid: string;
	field: string;
	value: string;
};

export async function saveAoiField(uid: string, field: string, value: string): Promise<void> {
	const res = await fetch("/area-of-improvement/api/save", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ uid, field, value } satisfies AoiSaveFieldPayload),
	});
	if (!res.ok) {
		const text = await res.text().catch(() => res.statusText);
		throw new Error(text || `HTTP ${res.status}`);
	}
}

export async function deleteAoiEvidenceFile(path: string): Promise<{ error: Error | null }> {
	const res = await fetch("/area-of-improvement/api/delete-file", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ path }),
	});
	if (!res.ok) {
		const t = await res.text();
		return { error: new Error(t || "Gagal menghapus file dari storage") };
	}
	return { error: null };
}

export type UploadAoiEvidenceOpts = {
	year: number;
	itemUid: string;
};

export async function uploadAoiEvidence(
	file: File,
	opts: UploadAoiEvidenceOpts
): Promise<{ path: string; fileName: string }> {
	const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
	const res = await fetch("/area-of-improvement/api/upload-url", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			fileName: file.name,
			fileSize: file.size,
			fileType: file.type,
			year: opts.year,
			itemUid: opts.itemUid,
			ext,
		}),
	});
	if (!res.ok) {
		const text = await res.text().catch(() => res.statusText);
		throw new Error(text || `HTTP ${res.status}`);
	}
	const { signedUrl, path } = (await res.json()) as { signedUrl: string; path: string };

	const uploadRes = await fetch(signedUrl, {
		method: "PUT",
		headers: { "Content-Type": file.type },
		body: file,
	});
	if (!uploadRes.ok) {
		throw new Error(`Upload gagal: HTTP ${uploadRes.status}`);
	}

	return { path, fileName: file.name };
}
