<script lang="ts">
  import { onMount } from "svelte";
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import SummaryCards from "./summary-cards.svelte";
  import DataTable from "./data-table.svelte";
  import { Toaster } from "svelte-sonner";
  import type { PageData } from "./$types.js";
  
  let { data }: { data: PageData } = $props();
  
  let isLoading = $state(true);
  // svelte-ignore state_referenced_locally
  let assessmentData = $state(data.assessmentData || []);

  // Update state when server data changes (e.g. year change)
  $effect(() => {
    assessmentData = data.assessmentData || [];
  });
  
  onMount(() => {
    // Artificial delay to show skeleton as requested "sesaat"
    const timer = setTimeout(() => {
      isLoading = false;
    }, 800);
    return () => clearTimeout(timer);
  });
</script>

<Toaster position="top-right" richColors />

<Sidebar.Provider
  style="--sidebar-width: calc(var(--spacing) * 80); --header-height: calc(var(--spacing) * 14);"
>
  <AppSidebar
    variant="inset"
    user={{ name: "Pengguna", email: "user@example.com", avatarUrl: null }}
  />
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
      <SummaryCards 
        {assessmentData} 
        {isLoading} 
      />
      <DataTable 
        {assessmentData} 
        currentYear={data.year}
        assessmentId={data.assessmentId}
        {isLoading} 
      />
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
