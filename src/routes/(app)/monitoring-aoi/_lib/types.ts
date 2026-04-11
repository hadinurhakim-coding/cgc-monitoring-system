export interface AoiStatusCounts {
	selesai: number;
	onProgress: number;
	tidakDapat: number;
	belum: number;
}

export function emptyStatusCounts(): AoiStatusCounts {
	return { selesai: 0, onProgress: 0, tidakDapat: 0, belum: 0 };
}

export function addStatusCounts(a: AoiStatusCounts, b: AoiStatusCounts): AoiStatusCounts {
	return {
		selesai: a.selesai + b.selesai,
		onProgress: a.onProgress + b.onProgress,
		tidakDapat: a.tidakDapat + b.tidakDapat,
		belum: a.belum + b.belum,
	};
}

export interface AoiSectionRow {
	sectionId: string;
	sectionLabel: string;
	partId: string;
	levelLabel: string;
	jumlahAoi: number;
	statusCounts: AoiStatusCounts;
}

export interface AoiPartGroup {
	partId: string;
	partLabel: string;
	fullNameId: string;
	levelLabel: string;
	sections: AoiSectionRow[];
	totalAoi: number;
	statusCounts: AoiStatusCounts;
	keterangan: string;
}

export interface AoiLevelGroup {
	levelLabel: string;
	parts: AoiPartGroup[];
	totalAoi: number;
	statusCounts: AoiStatusCounts;
}

export interface MonitoringGrandTotal {
	jumlahAoi: number;
	statusCounts: AoiStatusCounts;
}
