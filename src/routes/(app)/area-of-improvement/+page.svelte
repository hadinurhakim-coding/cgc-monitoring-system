<script lang="ts">
  import { refreshCachedPageData } from "$lib/client/cached-page-load.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import type { PageData } from "./$types.js";
  import AoiTable from "./_components/aoi-table.svelte";

  let { data }: { data: PageData } = $props();
  let refreshedData = $state<PageData | null>(null);
  const viewData = $derived(refreshedData ?? data);

  $effect(() => {
    data.cacheKey;
    refreshedData = null;
  });

  $effect(() => {
    if (data.cacheState !== "cached") return;
    let cancelled = false;
    refreshCachedPageData({
      url: data.dataUrl,
      cacheKey: data.cacheKey,
      scope: data.cacheScope,
      route: "/area-of-improvement",
    })
      .then((fresh) => {
        if (!cancelled) refreshedData = { ...viewData, ...fresh };
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Gagal memuat pembaruan";
        if (!cancelled) refreshedData = { ...viewData, refreshError: message };
      });
    return () => {
      cancelled = true;
    };
  });

  const canWrite = $derived(viewData.authUser.role === "admin" || viewData.authUser.role === "bpo");
</script>

<header
  class="bg-background sticky top-0 z-20 flex h-(--header-height) items-center gap-3 border-b px-4 md:px-6"
>
  <Sidebar.Trigger class="-ms-1" />
  <Separator orientation="vertical" class="data-[orientation=vertical]:h-5" />
  <h1 class="text-lg font-semibold uppercase tracking-tight text-primary">Area of Improvement</h1>
</header>

<main class="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden p-4 md:gap-6 md:p-6">
  {#if viewData.loadError}
    <div
      class="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      role="alert"
    >
      {viewData.loadError}
    </div>
  {/if}
  {#if viewData.cacheState === "cached" && viewData.refreshError}
    <div class="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-xs text-destructive" role="status">
      {viewData.refreshError}
    </div>
  {/if}

  <AoiTable
    items={viewData.items}
    currentYear={viewData.year}
    availableYears={viewData.availableYears.length > 0 ? viewData.availableYears : [viewData.year]}
    {canWrite}
    cacheKey={viewData.cacheKey}
    cacheScope={viewData.cacheScope}
  />
</main>
