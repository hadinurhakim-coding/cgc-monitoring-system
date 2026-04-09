<script lang="ts">
	import * as Chart from "$lib/components/ui/chart/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import ChartContainer from "$lib/components/ui/chart/chart-container.svelte";
	import { scaleLinear } from "d3-scale";
	import { Area, AreaChart, ChartClipPath } from "layerchart";
	import { curveNatural } from "d3-shape";
	import { cubicInOut } from "svelte/easing";
	import { Calendar, Check, Search } from "@lucide/svelte";

	type TrendPoint = {
		year: number;
		score_pct: number;
	};

	interface Props {
		trend?: TrendPoint[];
		availableYears?: number[];
		selectedYear?: number;
		onYearChange?: (year: string) => void;
	}

	let {
		trend = [],
		availableYears = [],
		selectedYear = new Date().getFullYear(),
		onYearChange = (_y: string) => {},
	}: Props = $props();

	// Year dropdown filter (same pattern as table-toolbar.svelte)
	let yearQuery = $state("");

	const years = $derived.by(() => {
		const nowYear = new Date().getFullYear();
		const fromDb = [...availableYears].sort((a, b) => b - a).map(String);
		const sliding = Array.from({ length: 18 }, (_, i) => String(nowYear + 1 - i));
		const merged = [...new Set([...fromDb, ...sliding])];
		merged.sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
		if (yearQuery && !merged.includes(yearQuery) && /^\d{4}$/.test(yearQuery)) {
			merged.unshift(yearQuery);
		}
		return merged.filter((y) => y.includes(yearQuery));
	});

	// Chart data: one point per year, ordered ascending
	const chartData = $derived(
		[...trend]
			.sort((a, b) => a.year - b.year)
			.map((r) => ({ year: r.year, score: r.score_pct }))
	);

	const chartConfig = {
		score: { label: "Skor (%)", color: "var(--chart-1)" },
	} satisfies Chart.ChartConfig;
</script>

<Card.Root>
	<Card.Header class="flex flex-col gap-3 border-b py-5 sm:flex-row sm:items-center sm:gap-2 sm:space-y-0">
		<div class="grid flex-1 gap-1 text-center sm:text-start">
			<Card.Title>Tren skor tahunan</Card.Title>
			<Card.Description>
				Persentase skor ACGS per tahun dari <code>acgs_year_summaries</code>.
			</Card.Description>
		</div>

		<!-- Year filter — same DropdownMenu pattern as table-toolbar.svelte -->
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md bg-white border border-primary/20 hover:border-primary/40 hover:bg-slate-50 transition-all font-medium text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
			>
				<Calendar size={16} class="text-primary" />
				Tahun: <span class="text-primary font-bold">{selectedYear}</span>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-48 p-0" align="end">
				<div class="p-2 border-b">
					<div class="relative">
						<Search class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
						<input
							type="text"
							placeholder="Cari tahun..."
							class="w-full pl-7 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-primary outline-none"
							bind:value={yearQuery}
						/>
					</div>
				</div>
				<div class="max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
					{#each years as year (year)}
						<DropdownMenu.Item
							class="flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer rounded-md text-xs {String(selectedYear) === year ? 'bg-primary/5 text-primary font-bold' : ''}"
							onSelect={() => onYearChange(year)}
						>
							<span>{year}</span>
							{#if String(selectedYear) === year}
								<Check size={14} class="text-primary" />
							{/if}
						</DropdownMenu.Item>
					{/each}
					{#if years.length === 0}
						<div class="px-2 py-4 text-[10px] text-center text-muted-foreground italic">
							Tahun tidak valid
						</div>
					{/if}
				</div>
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
					series={[
						{
							key: "score",
							label: chartConfig.score.label,
							color: chartConfig.score.color,
						},
					]}
					props={{
						xAxis: {
							format: (v: number) => String(v),
						},
						yAxis: {
							format: (v: number) => `${v}%`,
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
