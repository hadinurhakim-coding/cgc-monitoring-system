<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";

	import type { PageData } from "./$types.js";
	import AuditLogTable from "./_components/audit-log-table.svelte";
	import TrendScoreAreaChart from "./_components/trend-score-area-chart.svelte";

	let { data }: { data: PageData } = $props();
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
		rows={data.activity}
		selectedYear={data.selectedYear}
		search={data.search}
		sourceFilter={data.sourceFilter}
		fieldFilter={data.fieldFilter}
		limitedByDivision={data.limitedByDivision}
	/>
</main>
