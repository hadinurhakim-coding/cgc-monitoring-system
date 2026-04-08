<script lang="ts">
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Search, Cloud, Loader2, AlertCircle, Calendar, Check, FileDown, LayoutDashboard } from "@lucide/svelte";
  import ScoreSummaryTable from "./score-summary-table.svelte";
  import type { AssessmentItem } from "../_lib/types.js";

  let { 
    searchQuery = $bindable(""),
    onSearch,
    onSearchInput, // Add this
    syncStatus = "saved",
    selectedYear = $bindable(""),
    availableYears = [],
    onExportPdf,
    assessmentQuestions = [] as AssessmentItem[]
  }: {
    searchQuery: string;
    onSearch: () => void;
    onSearchInput?: () => void; // Add this
    syncStatus: "saved" | "saving" | "error";
    selectedYear: string;
    availableYears: number[];
    onExportPdf?: () => void;
    assessmentQuestions: AssessmentItem[];
  } = $props();

  let yearQuery = $state("");

  const years = $derived(() => {
    const nowYear = new Date().getFullYear();
    const fromDb = [...availableYears]
      .sort((a, b) => b - a)
      .map((y) => String(y));
    const sliding = Array.from({ length: 18 }, (_, i) =>
      String(nowYear + 1 - i),
    );
    const merged = [...new Set([...fromDb, ...sliding])];
    merged.sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
    
    if (yearQuery && !merged.includes(yearQuery) && /^\d{4}$/.test(yearQuery)) {
      merged.unshift(yearQuery);
    }
    return merged.filter((y) => y.includes(yearQuery));
  });
</script>

<div class="flex flex-col md:flex-row items-center justify-between gap-4">
  <form
    class="relative w-full md:w-96 flex gap-2"
    onsubmit={(e) => {
      e.preventDefault();
      onSearch();
    }}
  >
    <div class="relative flex-1">
      <Search
        class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        size={18}
      />
      <Input
        placeholder="Filter lokal (debounce) — Enter: simpan ke URL…"
        class="pl-10 border-border focus:ring-primary"
        bind:value={searchQuery}
        oninput={onSearchInput}
      />
    </div>
    <Button type="submit" variant="secondary" size="sm" class="shrink-0"
      >Cari</Button
    >
  </form>
  <div class="flex items-center gap-2">
    <!-- DASHBOARD SUMMARY DIALOG -->
    <Dialog.Root>
      <Dialog.Trigger>
        {#snippet child({ props })}
          <Button variant="outline" size="sm" class="h-8 w-8 px-0 rounded-full text-slate-600 mr-2" {...props}>
            <LayoutDashboard size={16} />
          </Button>
        {/snippet}
      </Dialog.Trigger>
      <Dialog.Content class="max-w-[95vw]! w-[95vw]! h-auto p-8">
        <Dialog.Header class="mb-4">
          <Dialog.Title class="text-lg font-bold text-slate-800 text-center">
            Tabel Skor Capaian Assessment ACGS PT PLN (Persero), Tahun Buku {selectedYear}
          </Dialog.Title>
        </Dialog.Header>
        <div class="w-full overflow-x-auto">
          <ScoreSummaryTable questions={assessmentQuestions} />
        </div>
      </Dialog.Content>
    </Dialog.Root>

    <!-- SYNC STATUS -->
    <div
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-medium mr-2"
    >
      {#if syncStatus === "saved"}
        <Cloud size={14} class="text-emerald-500" />
        <span class="text-slate-600">Tersimpan</span>
      {:else if syncStatus === "saving"}
        <Loader2 size={14} class="text-primary animate-spin" />
        <span class="text-primary">Menyimpan...</span>
      {:else}
        <AlertCircle size={14} class="text-red-500" />
        <span class="text-red-500">Gagal Sinkron</span>
      {/if}
    </div>

    <!-- YEAR FILTER DROPDOWN -->
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
            <Search
              class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
              size={12}
            />
            <input
              type="text"
              placeholder="Cari tahun..."
              class="w-full pl-7 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-primary outline-none"
              bind:value={yearQuery}
            />
          </div>
        </div>
        <div class="max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
          {#each years() as year}
            <DropdownMenu.Item
              class="flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer rounded-md text-xs {selectedYear ===
              year
                ? 'bg-primary/5 text-primary font-bold'
                : ''}"
              onSelect={() => {
                selectedYear = year;
              }}
            >
              <span>{year}</span>
              {#if selectedYear === year}
                <Check size={14} class="text-primary" />
              {/if}
            </DropdownMenu.Item>
          {/each}
          {#if years().length === 0}
            <div
              class="px-2 py-4 text-[10px] text-center text-muted-foreground italic"
            >
              Tahun tidak valid
            </div>
          {/if}
        </div>
      </DropdownMenu.Content>
    </DropdownMenu.Root>

    <Button variant="outline" size="sm" class="gap-2" onclick={onExportPdf}>
      <FileDown size={16} />
      Export PDF
    </Button>
  </div>
</div>
