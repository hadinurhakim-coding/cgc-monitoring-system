import { assessmentData } from "../../assessment-acgs/_data/assessment-master.js";

export interface StandarOption {
	value: string;
	label: string;
	part: string;
	level: string;
	standarLabel: string;
}

export function buildStandarOptions(): StandarOption[] {
	const options: StandarOption[] = [];
	for (const item of assessmentData) {
		if (item.type !== "section") continue;
		const id = (item.id ?? "").trim();
		if (!id) continue;
		const nameId = (item.name_id ?? "").trim();
		const label = nameId ? `${id} - ${nameId}` : id;
		options.push({
			value: id,
			label,
			part: item.part ?? "",
			level: item.level ?? "",
			standarLabel: label,
		});
	}
	return options;
}
