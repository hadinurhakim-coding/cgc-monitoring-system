export const MIN_DATA_YEAR = 2024;

export function buildYearOptions(
	availableYears: number[],
	query: string,
	currentYear = new Date().getFullYear()
): string[] {
	const latestYear = currentYear + 1;
	const generatedYears = Array.from(
		{ length: Math.max(latestYear - MIN_DATA_YEAR + 1, 1) },
		(_, index) => String(latestYear - index)
	);
	const databaseYears = availableYears
		.filter((year) => year >= MIN_DATA_YEAR)
		.map(String);
	const merged = [...new Set([...databaseYears, ...generatedYears])].sort(
		(a, b) => Number.parseInt(b, 10) - Number.parseInt(a, 10)
	);

	if (
		query &&
		!merged.includes(query) &&
		/^\d{4}$/.test(query) &&
		Number.parseInt(query, 10) >= MIN_DATA_YEAR
	) {
		merged.unshift(query);
	}

	return merged.filter(
		(year) =>
			Number.parseInt(year, 10) >= MIN_DATA_YEAR &&
			year.includes(query)
	);
}
