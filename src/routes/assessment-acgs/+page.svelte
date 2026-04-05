<script lang="ts">
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import SummaryCards from "./summary-cards.svelte";
  import DataTable from "./data-table.svelte";
  import type { AssessmentItem } from "./data-table.svelte";
  import { Toaster } from "svelte-sonner";
  import type { PageData } from "./$types.js";

  let { data }: { data: PageData } = $props();

  const sidebarUser = $derived({
    name: data.authUser?.email?.split("@")[0] || "Pengguna",
    email: data.authUser?.email || "",
    avatarUrl: null as string | null
  });
</script>

<Toaster position="top-right" richColors />

<Sidebar.Provider
  style="--sidebar-width: calc(var(--spacing) * 80); --header-height: calc(var(--spacing) * 14);"
>
  <AppSidebar variant="inset" user={sidebarUser} />
  <Sidebar.Inset>
    <header
      class="bg-background sticky top-0 z-20 flex h-(--header-height) items-center gap-3 border-b px-4 md:px-6"
    >
      <Sidebar.Trigger class="-ms-1" />
      <Separator
        orientation="vertical"
        class="data-[orientation=vertical]:h-5"
      />
      <h1 class="text-lg font-semibold uppercase tracking-tight text-primary">Assessment ACGS</h1>
    </header>

    <main
      class="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 overflow-hidden"
    >
      {#if data.loadError}
        <div
          class="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {data.loadError}
        </div>
      {/if}
      <SummaryCards
        summaryMetrics={data.summaryMetrics}
        assessmentData={[]}
        isLoading={false}
      />
      <DataTable
        initialQuestions={(data.assessmentQuestions || []) as AssessmentItem[]}
        serverSearch={data.search ?? ""}
        structureFallbackData={[]}
        currentYear={data.year}
        availableYears={data.availableYears || []}
        isLoading={false}
      />
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
