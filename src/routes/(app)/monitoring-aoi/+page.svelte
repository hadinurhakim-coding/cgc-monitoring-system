<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import type { PageData } from "./$types.js";
  import MonitoringTable from "./_components/monitoring-table.svelte";

  let { data }: { data: PageData } = $props();

  const canWrite = $derived(data.authUser.role === "admin" || data.authUser.role === "bpo");
</script>

<header
  class="bg-background sticky top-0 z-20 flex h-(--header-height) items-center gap-3 border-b px-4 md:px-6"
>
  <Sidebar.Trigger class="-ms-1" />
  <Separator orientation="vertical" class="data-[orientation=vertical]:h-5" />
  <h1 class="text-lg font-semibold uppercase tracking-tight text-primary">Monitoring Tindak Lanjut AOI</h1>
</header>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 overflow-hidden">
  {#if data.loadError}
    <div
      class="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      role="alert"
    >
      {data.loadError}
    </div>
  {/if}

  <MonitoringTable
    levels={data.levels}
    grandTotal={data.grandTotal}
    currentYear={data.year}
    availableYears={data.availableYears.length > 0 ? data.availableYears : [data.year]}
    {canWrite}
  />
</main>
