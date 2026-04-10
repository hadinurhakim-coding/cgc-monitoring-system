<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { page } from "$app/state";
	import type { PageData } from "./$types.js";
	import TrendScoreAreaChart from "./_components/trend-score-area-chart.svelte";

	let { data }: { data: PageData } = $props();

	function fmtDateTime(iso: string) {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		return d.toLocaleString();
	}

	// ── Realtime audit log ─────────────────────────────────────
	type ActivityRow = (typeof data.activity)[number];

	let activity = $state<ActivityRow[]>([]);
	$effect(() => { activity = data.activity ?? []; });

	$effect(() => {
		const token = data.accessToken;
		const selectedYear = data.selectedYear;
		if (!token) return;

		let cancelled = false;
		let removeChannel: (() => void) | null = null;

		// Dynamic import — hindari Supabase createClient dieksekusi saat SSR
		import("$lib/supabase-browser.js").then(({ createBrowserSupabase }) => {
			if (cancelled) return;

			const client = createBrowserSupabase(token);
			const channel = client
				.channel(`audit-log-${selectedYear}`)
				.on(
					"postgres_changes",
					{ event: "INSERT", schema: "public", table: "assessment_change_logs" },
					(payload) => {
						const row = payload.new as ActivityRow;
						if (Number(row.year) !== selectedYear) return;
						activity = [row, ...activity].slice(0, 20);
					}
				)
				.subscribe();

			removeChannel = () => { client.removeChannel(channel); };
		});

		return () => {
			cancelled = true;
			removeChannel?.();
		};
	});
</script>

<header
	class="bg-background sticky top-0 z-20 flex h-(--header-height) items-center gap-3 border-b px-4 md:px-6"
>
	<Sidebar.Trigger class="-ms-1" />
	<Separator orientation="vertical" class="data-[orientation=vertical]:h-5" />
	<h1 class="text-lg font-semibold">Dashboard</h1>
</header>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">

	<TrendScoreAreaChart trend={data.trend} />

	<!-- Aktivitas terbaru -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Aktivitas Terbaru (Audit Log)</Card.Title>
			<Card.Description>
				20 perubahan terakhir untuk tahun {data.selectedYear}.
				{#if page.data.authUser?.role !== "admin"}(dibatasi divisi){/if}
				<span class="ml-2 inline-flex items-center gap-1 text-emerald-600 text-[10px] font-medium">
					<span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
					Realtime
				</span>
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
						{#if activity.length}
							{#each activity as row (row.id)}
								<tr class="hover:bg-muted/20 transition-colors">
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
