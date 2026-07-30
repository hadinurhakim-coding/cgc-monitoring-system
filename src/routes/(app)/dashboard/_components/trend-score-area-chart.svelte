<script lang="ts">
	import { Calendar } from "@lucide/svelte";
	import { scaleLinear } from "d3-scale";
	import { curveLinear } from "d3-shape";
	import { Area, AreaChart, ChartClipPath } from "layerchart";
	import { cubicInOut } from "svelte/easing";

	import * as Card from "$lib/components/ui/card/index.js";
	import * as Chart from "$lib/components/ui/chart/index.js";
	import ChartContainer from "$lib/components/ui/chart/chart-container.svelte";

	type TrendPoint = {
		year: number;
		score_pct: number;
		overall_score: number;
		has_data: boolean;
	};

	type ChartPoint = {
		year: number;
		score: number;
		scorePct: number;
	};

	interface Props {
		trend?: TrendPoint[];
	}

	let { trend = [] }: Props = $props();

	const chartData = $derived.by((): ChartPoint[] =>
		trend
			.filter((point) => point.has_data)
			.sort((a, b) => a.year - b.year)
			.map((point) => ({
				year: point.year,
				score: point.overall_score,
				scorePct: point.score_pct
			}))
	);

	const chartConfig = {
		score: { label: "Total Skor", color: "var(--chart-1)" }
	} satisfies Chart.ChartConfig;

	const scoreFormatter = new Intl.NumberFormat("id-ID", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	});

	function formatScore(value: number): string {
		return scoreFormatter.format(value);
	}

	function formatPercentage(value: number): string {
		return `${scoreFormatter.format(value)}%`;
	}
</script>

<Card.Root class="gap-0 py-0">
	<div class="grid lg:grid-cols-3">
		<section class="flex min-w-0 flex-col lg:col-span-2">
			<header class="flex flex-col gap-2 p-6 sm:flex-row sm:items-start sm:justify-between">
				<div class="grid gap-1">
					<Card.Title>Tren skor tahunan</Card.Title>
					<Card.Description>
						Total Skor ACGS per tahun yang memiliki data (maks. 130).
					</Card.Description>
				</div>
				<div
					class="bg-primary/10 text-primary inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold"
				>
					Maks. 130 poin
				</div>
			</header>

			<div class="flex flex-1 items-center px-4 pb-6 sm:px-6">
				{#if chartData.length === 0}
					<div class="text-muted-foreground flex h-72 w-full items-center justify-center text-sm">
						Belum ada data tren tersedia.
					</div>
				{:else}
					<ChartContainer config={chartConfig} class="aspect-auto h-72 w-full">
						<AreaChart
							data={chartData}
							x="year"
							xScale={scaleLinear()}
							yScale={scaleLinear().domain([0, 130])}
							series={[
								{
									key: "score",
									label: chartConfig.score.label,
									color: chartConfig.score.color
								}
							]}
							props={{
								xAxis: {
									ticks: chartData.map((point) => point.year),
									tickMarks: false,
									format: (value: number) => String(value)
								},
								yAxis: {
									ticks: [0, 26, 52, 78, 104, 130],
									tickMarks: false,
									grid: true,
									format: (value: number) => String(Math.round(value))
								}
							}}
						>
							{#snippet marks({ context })}
								<defs>
									<linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stop-color="var(--color-score)" stop-opacity={0.72} />
										<stop offset="95%" stop-color="var(--color-score)" stop-opacity={0.08} />
									</linearGradient>
								</defs>
								<ChartClipPath
									motion={{
										width: { type: "tween", duration: 1000, easing: cubicInOut }
									}}
								>
									{#each context.series.visibleSeries as series (series.key)}
										<Area
											seriesKey={series.key}
											curve={curveLinear}
											fillOpacity={0.55}
											line={{ class: "stroke-2" }}
											motion="tween"
											{...series.props}
											fill="url(#fillScore)"
										/>
									{/each}
								</ChartClipPath>
							{/snippet}
							{#snippet tooltip()}
								<Chart.Tooltip
									labelFormatter={(value: unknown) => `Tahun ${value}`}
									indicator="line"
								/>
							{/snippet}
						</AreaChart>
					</ChartContainer>
				{/if}
			</div>
		</section>

		<aside class="border-t p-6 lg:border-t-0 lg:border-l">
			<div class="grid gap-1">
				<Card.Title>Ringkasan skor</Card.Title>
				<Card.Description>Capaian ACGS per tahun</Card.Description>
			</div>

			<div class="mt-6 grid gap-3">
				{#if chartData.length === 0}
					<div class="bg-muted/50 text-muted-foreground rounded-xl p-4 text-sm">
						Belum ada tahun dengan data capaian.
					</div>
				{:else}
					{#each chartData as point (point.year)}
						<div class="bg-muted/60 flex items-center gap-4 rounded-xl p-4">
							<div class="bg-background text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
								<Calendar size={19} />
							</div>
							<div class="min-w-0 flex-1">
								<p class="text-muted-foreground text-sm font-medium">Tahun {point.year}</p>
								<div class="mt-0.5 flex flex-wrap items-baseline gap-x-2">
									<p class="text-foreground text-xl font-semibold">
										{formatScore(point.score)}
										<span class="text-muted-foreground text-xs font-normal">/ 130</span>
									</p>
									<span class="text-primary text-xs font-semibold">
										{formatPercentage(point.scorePct)}
									</span>
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</aside>
	</div>
</Card.Root>
