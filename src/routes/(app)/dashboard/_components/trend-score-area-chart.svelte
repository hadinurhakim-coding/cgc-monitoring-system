<script lang="ts">
	import * as Chart from "$lib/components/ui/chart/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import ChartContainer from "$lib/components/ui/chart/chart-container.svelte";
	import { scaleLinear } from "d3-scale";
	import { Area, AreaChart, ChartClipPath } from "layerchart";
	import { curveNatural } from "d3-shape";
	import { cubicInOut } from "svelte/easing";
	import { Calendar, Check } from "@lucide/svelte";

	type TrendPoint = {
		year: number;
		score_pct: number;
		overall_score: number;
	};

	interface Props {
		trend?: TrendPoint[];
	}

	let { trend = [] }: Props = $props();

	const RANGES = [
		{ value: 1,  label: "1 tahun ini" },
		{ value: 3,  label: "3 tahun" },
		{ value: 6,  label: "6 tahun" },
		{ value: 10, label: "10 tahun" },
	] as const;

	let rangeYears = $state<1 | 3 | 6 | 10>(3);

	const selectedRangeLabel = $derived(
		RANGES.find((r) => r.value === rangeYears)?.label ?? "3 tahun"
	);

	// Filter data by range from the most recent year in the dataset
	const chartData = $derived.by(() => {
		const sorted = [...trend].sort((a, b) => a.year - b.year);
		if (sorted.length === 0) return [];
		const maxYear = sorted[sorted.length - 1].year;
		const minYear = maxYear - rangeYears + 1;
		return sorted
			.filter((r) => r.year >= minYear)
			.map((r) => ({ year: r.year, score: r.overall_score }));
	});

	const chartConfig = {
		score: { label: "Total Skor (maks. 130)", color: "var(--chart-1)" },
	} satisfies Chart.ChartConfig;
</script>

<Card.Root>
	<Card.Header class="flex flex-col gap-3 border-b py-5 sm:flex-row sm:items-center sm:gap-2 sm:space-y-0">
		<div class="grid flex-1 gap-1 text-center sm:text-start">
			<Card.Title>Tren skor tahunan</Card.Title>
			<Card.Description>
				Total Skor ACGS per tahun (maks. 130), sesuai tabel capaian.
			</Card.Description>
		</div>

		<!-- Range filter -->
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md bg-white border border-primary/20 hover:border-primary/40 hover:bg-slate-50 transition-all font-medium text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
			>
				<Calendar size={16} class="text-primary" />
				<span class="text-primary font-bold">{selectedRangeLabel}</span>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-40" align="end">
				{#each RANGES as range (range.value)}
					<DropdownMenu.Item
						class="flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer rounded-md text-xs {rangeYears === range.value ? 'bg-primary/5 text-primary font-bold' : ''}"
						onSelect={() => { rangeYears = range.value; }}
					>
						<span>{range.label}</span>
						{#if rangeYears === range.value}
							<Check size={14} class="text-primary" />
						{/if}
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Card.Header>
	<Card.Content>
		{#if chartData.length === 0}
			<div class="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
				Belum ada data tren tersedia.
			</div>
		{:else}
			<ChartContainer config={chartConfig} class="-ml-3 aspect-auto h-[250px] w-full">
				<AreaChart
					legend
					data={chartData}
					x="year"
					xScale={scaleLinear()}
					yScale={scaleLinear().domain([0, 130]).nice()}
					series={[
						{
							key: "score",
							label: chartConfig.score.label,
							color: chartConfig.score.color,
						},
					]}
					props={{
						xAxis: {
							ticks: chartData.map((d) => d.year),
							format: (v: number) => String(v),
						},
						yAxis: {
							format: (v: number) => String(Math.round(v)),
						},
					}}
				>
					{#snippet marks({ context })}
						<defs>
							<linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stop-color="var(--color-score)" stop-opacity={1} />
								<stop offset="95%" stop-color="var(--color-score)" stop-opacity={0.12} />
							</linearGradient>
						</defs>
						<ChartClipPath
							motion={{
								width: { type: "tween", duration: 1000, easing: cubicInOut },
							}}
						>
							{#each context.series.visibleSeries as s (s.key)}
								<Area
									seriesKey={s.key}
									curve={curveNatural}
									fillOpacity={0.4}
									line={{ class: "stroke-1" }}
									motion="tween"
									{...s.props}
									fill="url(#fillScore)"
								/>
							{/each}
						</ChartClipPath>
					{/snippet}
					{#snippet tooltip()}
						<Chart.Tooltip
							labelFormatter={(v: number) => `Tahun ${v}`}
							indicator="line"
						/>
					{/snippet}
				</AreaChart>
			</ChartContainer>
		{/if}
	</Card.Content>
</Card.Root>
