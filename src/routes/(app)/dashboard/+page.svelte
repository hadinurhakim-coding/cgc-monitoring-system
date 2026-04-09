<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import type { PageData } from "./$types.js";
	import TrendScoreAreaChart from "./_components/trend-score-area-chart.svelte";

	let { data }: { data: PageData } = $props();

	let year = $state("");
	let q = $state("");

	$effect(() => {
		year = String(data.selectedYear ?? new Date().getFullYear());
		q = String(data.search ?? "");
	});

	function applyFilters() {
		const y = encodeURIComponent(year.trim());
		const qq = encodeURIComponent(q.trim());
		goto(`${resolve("/dashboard")}?year=${y}&q=${qq}`, { keepFocus: true, noScroll: true });
	}

	function fmtDateTime(iso: string) {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		return d.toLocaleString();
	}

</script>

<header
	class="bg-background sticky top-0 z-20 flex h-(--header-height) items-center gap-3 border-b px-4 md:px-6"
>
	<Sidebar.Trigger class="-ms-1" />
	<Separator orientation="vertical" class="data-[orientation=vertical]:h-5" />
	<h1 class="text-lg font-semibold">Dashboard</h1>
</header>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
	<Card.Root>
		<Card.Header>
			<Card.Title>Dashboard</Card.Title>
			<Card.Description>
				{#if data.canAct}
					Role Anda dapat melihat dan melakukan aksi.
				{:else}
					Role viewer: read-only (tanpa aksi).
				{/if}
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div class="grid w-full grid-cols-1 gap-3 md:w-auto md:grid-cols-3">
					<div class="space-y-1">
						<div class="text-xs font-medium text-muted-foreground">Tahun</div>
						<Input bind:value={year} placeholder="2026" />
					</div>
					<div class="space-y-1 md:col-span-2">
						<div class="text-xs font-medium text-muted-foreground">Search (audit)</div>
						<Input bind:value={q} placeholder="email / field / item_id" />
					</div>
				</div>

				<div class="flex gap-2">
					<Button variant="secondary" onclick={applyFilters}>Terapkan</Button>
					<Button variant="outline" href={resolve("/assessment-acgs")}>
						Buka Assessment ACGS
					</Button>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<TrendScoreAreaChart
		trend={data.trend}
		availableYears={data.trend.map((r) => r.year)}
		selectedYear={data.selectedYear}
		onYearChange={(y) => { year = y; applyFilters(); }}
	/>

	<!-- Aktivitas terbaru -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Aktivitas Terbaru (Audit Log)</Card.Title>
			<Card.Description>
				20 perubahan terakhir untuk tahun {data.selectedYear}. {#if page.data.authUser?.role !== "admin"}(dibatasi divisi){/if}
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="overflow-x-auto">
				<table class="w-full min-w-[900px] border-collapse text-sm">
					<thead>
						<tr class="bg-muted/40 text-left">
							<th class="border-b p-2">Waktu</th>
							<th class="border-b p-2">User</th>
							<th class="border-b p-2">Item</th>
							<th class="border-b p-2">Field</th>
							<th class="border-b p-2">Old</th>
							<th class="border-b p-2">New</th>
						</tr>
					</thead>
					<tbody>
						{#if data.activity?.length}
							{#each data.activity as row (row.id)}
								<tr class="hover:bg-muted/20">
									<td class="border-b p-2 whitespace-nowrap">{fmtDateTime(row.created_at)}</td>
									<td class="border-b p-2">{row.user_email}</td>
									<td class="border-b p-2">{row.item_id ?? "-"}</td>
									<td class="border-b p-2">{row.field}</td>
									<td class="border-b p-2 max-w-[240px] truncate" title={row.old_value ?? ""}>{row.old_value ?? ""}</td>
									<td class="border-b p-2 max-w-[240px] truncate" title={row.new_value ?? ""}>{row.new_value ?? ""}</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td colspan="6" class="p-6 text-center text-muted-foreground">
									Tidak ada aktivitas untuk filter ini.
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</Card.Content>
	</Card.Root>
</main>
