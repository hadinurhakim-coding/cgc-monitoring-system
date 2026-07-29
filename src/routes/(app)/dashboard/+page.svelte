<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import type { PageData } from "./$types.js";
	import AuditLogTable from "./_components/audit-log-table.svelte";
	import TrendScoreAreaChart from "./_components/trend-score-area-chart.svelte";

	let { data }: { data: PageData } = $props();

	// ── Realtime audit log ─────────────────────────────────────
	type ActivityRow = (typeof data.activity)[number];
	type RealtimeStatus = "connecting" | "live" | "error" | "unavailable";

	let activity = $state<ActivityRow[]>([]);
	let realtimeStatus = $state<RealtimeStatus>("unavailable");
	$effect(() => { activity = data.activity ?? []; });

	function isRecord(value: unknown): value is Record<string, unknown> {
		return typeof value === "object" && value !== null;
	}

	function nullableString(value: unknown): string | null {
		return value == null ? null : String(value);
	}

	function parseRealtimeActivity(value: unknown): ActivityRow | null {
		if (!isRecord(value)) return null;

		const id = Number(value.id);
		const year = Number(value.year);
		if (!Number.isFinite(id) || !Number.isFinite(year)) return null;

		return {
			id,
			created_at: String(value.created_at ?? ""),
			actor_user_id: nullableString(value.actor_user_id),
			actor_email: String(value.actor_email ?? ""),
			actor_role: nullableString(value.actor_role),
			division_id: nullableString(value.division_id),
			page_path: String(value.page_path ?? ""),
			action: String(value.action ?? ""),
			entity_type: String(value.entity_type ?? ""),
			entity_id: String(value.entity_id ?? ""),
			entity_label: nullableString(value.entity_label),
			year,
			field: String(value.field ?? ""),
			old_value: nullableString(value.old_value),
			new_value: nullableString(value.new_value),
			metadata: isRecord(value.metadata) ? value.metadata : {}
		};
	}

	$effect(() => {
		const token = data.accessToken;
		const selectedYear = data.selectedYear;
		if (!token) {
			realtimeStatus = "unavailable";
			return;
		}

		let cancelled = false;
		let removeChannel: (() => void) | null = null;
		realtimeStatus = "connecting";

		// Dynamic import — hindari Supabase createClient dieksekusi saat SSR
		import("$lib/supabase-browser.js").then(async ({ createBrowserSupabase }) => {
			if (cancelled) return;

			const client = await createBrowserSupabase(token);
			if (cancelled) return;
			const channel = client
				.channel(`audit-log-${selectedYear}`)
				.on(
					"postgres_changes",
					{ event: "INSERT", schema: "public", table: "application_audit_logs" },
					(payload) => {
						const row = parseRealtimeActivity(payload.new);
						if (!row) return;
						if (Number(row.year) !== selectedYear) return;
						activity = [row, ...activity].slice(0, 20);
					}
				)
				.subscribe((status, realtimeError) => {
					if (cancelled) return;
					if (status === "SUBSCRIBED") realtimeStatus = "live";
					else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
						realtimeStatus = "error";
						console.warn("[dashboard] realtime subscription failed:", realtimeError);
					}
					else realtimeStatus = "connecting";
				});

			removeChannel = () => { void client.removeChannel(channel); };
		}).catch(() => {
			if (!cancelled) realtimeStatus = "error";
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

<main class="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden p-4 md:gap-6 md:p-6">

	<TrendScoreAreaChart trend={data.trend} />

	<AuditLogTable
		rows={activity}
		selectedYear={data.selectedYear}
		search={data.search}
		sourceFilter={data.sourceFilter}
		fieldFilter={data.fieldFilter}
		limitedByDivision={data.limitedByDivision}
		{realtimeStatus}
	/>
</main>
