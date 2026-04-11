import type { AoiItem, StatusRekomendasi } from "./types.js";
import type { StandarOption } from "./aoi-standar-options.js";

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

export type AddAoiItemPayload = {
	year: number;
	sectionId: string;
	standarLabel: string;
	partId: string;
	levelLabel: string;
};

export async function addAoiItem(
	year: number,
	opt: StandarOption
): Promise<AoiItem> {
	const payload: AddAoiItemPayload = {
		year,
		sectionId: opt.value,
		standarLabel: opt.standarLabel,
		partId: opt.part,
		levelLabel: opt.level,
	};
	const res = await fetch("/area-of-improvement/api/add", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const text = await res.text().catch(() => res.statusText);
		throw new Error(text || `HTTP ${res.status}`);
	}
	const json = (await res.json()) as { ok: boolean; item: AoiItem };
	return json.item;
}

export async function deleteAoiItem(uid: string): Promise<void> {
	const res = await fetch("/area-of-improvement/api/delete", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ uid }),
	});
	if (!res.ok) {
		const text = await res.text().catch(() => res.statusText);
		throw new Error(text || `HTTP ${res.status}`);
	}
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
