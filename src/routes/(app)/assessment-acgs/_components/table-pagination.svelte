<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "@lucide/svelte";

  let {
    totalItems = 0,
    pageSize = $bindable(15),
    currentPage = $bindable(1),
    debouncedFilterText = "",
    allQuestionsCount = 0,
    currentYear = 2026
  }: {
    totalItems: number;
    pageSize: number;
    currentPage: number;
    debouncedFilterText?: string;
    allQuestionsCount?: number;
    currentYear?: number;
  } = $props();

  const totalPages = $derived(Math.max(1, Math.ceil(totalItems / pageSize)));
  const startIndex = $derived((currentPage - 1) * pageSize);
  const endIndex = $derived(Math.min(startIndex + pageSize, totalItems));

  const paginationRange = $derived(() => {
    const range = [];
    const delta = 1;
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    if (currentPage - delta > 2) range.unshift("...");
    if (currentPage + delta < totalPages - 1) range.push("...");
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  });

  $effect(() => {
    if (currentPage > totalPages) {
       currentPage = totalPages;
    }
  });

</script>

<div class="flex flex-col gap-3 py-2 text-slate-600 text-xs font-medium">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <span class="text-muted-foreground">
      {#if debouncedFilterText.trim()}
        <strong>{totalItems}</strong> cocok filter dari
        <strong>{allQuestionsCount}</strong> pertanyaan (tahun {currentYear})
        <span class="italic">— "{debouncedFilterText.trim()}"</span>
      {:else}
        <strong>{allQuestionsCount}</strong> pertanyaan (tahun {currentYear}),
        tampilan per halaman {pageSize}
      {/if}
    </span>
  </div>
  <div class="flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-2">
      <span>Baris tampilan per halaman</span>
      <select
        class="border border-border rounded px-2 py-1 bg-white outline-none focus:ring-1 focus:ring-primary"
        bind:value={pageSize}
        onchange={() => (currentPage = 1)}
      >
        <option value={15}>15</option>
        <option value={30}>30</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
    </div>

    <div class="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        disabled={currentPage === 1}
        onclick={() => (currentPage = 1)}
      >
        <ChevronsLeft size={16} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        disabled={currentPage === 1}
        onclick={() => currentPage--}
      >
        <ChevronLeft size={16} />
      </Button>

      <div class="flex items-center gap-1 mx-2">
        {#each paginationRange() as page}
          {#if page === "..."}
            <span class="px-2 text-slate-400">...</span>
          {:else}
            <Button
              variant={currentPage === page ? "default" : "ghost"}
              size="icon"
              class="h-8 w-8 {currentPage === page
                ? 'bg-[#ff7f50] hover:bg-[#ff7f50]/90 text-white'
                : ''}"
              onclick={() => (currentPage = page as number)}
            >
              {page}
            </Button>
          {/if}
        {/each}
      </div>

      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        disabled={currentPage === totalPages}
        onclick={() => currentPage++}
      >
        <ChevronRight size={16} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        disabled={currentPage === totalPages}
        onclick={() => (currentPage = totalPages)}
      >
        <ChevronsRight size={16} />
      </Button>
    </div>

    <div class="text-muted-foreground">
      Tampilan {totalItems > 0 ? startIndex + 1 : 0}-{endIndex} dari {totalItems}
      terunduh
    </div>
  </div>
</div>
