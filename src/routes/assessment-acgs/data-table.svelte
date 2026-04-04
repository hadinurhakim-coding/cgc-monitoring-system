<script lang="ts">
  import { assessmentData } from "./assessment-data.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { 
    ChevronLeft, 
    ChevronRight, 
    ChevronsLeft, 
    ChevronsRight,
    Search,
    FileDown,
    Upload,
    Plus,
    Calendar,
    Filter,
    Check
  } from "@lucide/svelte";

  interface AssessmentItem {
    type: string;
    level: string;
    part: string;
    section: string;
    id: string;
    label?: string;
    name_en?: string;
    name_id?: string;
    full_name_en?: string;
    full_name_id?: string;
    question_en: string;
    question_id: string;
    implementation?: string;
    evidence?: string;
    status?: string;
    recommendation?: string;
  }

  // State
  let searchQuery = $state("");
  let pageSize = $state(15);
  let currentPage = $state(1);

  // Year Filter State
  let selectedYear = $state("2024");
  let yearQuery = $state("");
  const years = $derived(() => {
    const list = [];
    const currentYear = new Date().getFullYear();
    for(let i = currentYear + 1; i >= currentYear - 10; i--) {
        list.push(i.toString());
    }
    if (yearQuery && !list.includes(yearQuery) && /^\d{4}$/.test(yearQuery)) {
        list.unshift(yearQuery);
    }
    return list.filter(y => y.includes(yearQuery));
  });

  // Filtered data
  const filteredData = $derived(
    assessmentData.filter((item) => {
      if (item.type !== 'question') return false;
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.id?.toLowerCase().includes(query) ||
        item.question_en?.toLowerCase().includes(query) ||
        item.question_id?.toLowerCase().includes(query)
      );
    }) as AssessmentItem[]
  );

  // Pagination stats
  const totalItems = $derived(filteredData.length);
  const totalPages = $derived(Math.ceil(totalItems / pageSize));
  const startIndex = $derived((currentPage - 1) * pageSize);
  const endIndex = $derived(Math.min(startIndex + pageSize, totalItems));
  
  // Current Page Questions
  const pagedQuestions = $derived(filteredData.slice(startIndex, endIndex));

  // Helper to find parent headers for a question
  function getHeadersForQuestion(questionId: string) {
    const question = assessmentData.find((item) => item.id === questionId);
    if (!question) return { level: null, part: null };
    
    const level = assessmentData.find((item) => item.type === 'level' && item.label === question.level);
    const part = assessmentData.find((item) => item.type === 'part' && item.id === question.part);
    return { level, part };
  }

  // Effect to reset page on search
  $effect(() => {
    if (searchQuery) currentPage = 1;
  });

  // Pagination range logic (1 2 3 ... 10)
  const paginationRange = $derived(() => {
    const range = [];
    const delta = 1;
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
    }
    if (currentPage - delta > 2) range.unshift("...");
    if (currentPage + delta < totalPages - 1) range.push("...");
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  });

</script>

<div class="space-y-4">
  <!-- SEARCH & ACTIONS -->
  <div class="flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="relative w-full md:w-96">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <Input 
        placeholder="Cari ID atau indikator..." 
        class="pl-10 border-border focus:ring-primary"
        bind:value={searchQuery}
      />
    </div>
    <div class="flex items-center gap-2">
        <!-- YEAR FILTER DROPDOWN -->
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="outline" size="sm" class="gap-2 border-primary/20 hover:border-primary/40 hover:bg-slate-50 transition-all font-medium">
              <Calendar size={16} class="text-primary" />
              Tahun: <span class="text-primary font-bold">{selectedYear}</span>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content class="w-48 p-0" align="end">
            <div class="p-2 border-b">
               <div class="relative">
                 <Search class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
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
                  class="flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer rounded-md text-xs {selectedYear === year ? 'bg-primary/5 text-primary font-bold' : ''}"
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
                <div class="px-2 py-4 text-[10px] text-center text-muted-foreground italic">
                  Tahun tidak valid
                </div>
              {/if}
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <Button variant="outline" size="sm" class="gap-2">
            <FileDown size={16} />
            Export PDF
        </Button>
    </div>
  </div>

  <!-- TABLE CONTAINER -->
  <div class="overflow-x-auto w-full border border-border rounded-lg bg-white shadow-sm overflow-hidden">
    <table class="w-full border-collapse text-[11px] md:text-xs">
      <!-- HEADER -->
      <thead class="bg-primary text-white text-center font-bold sticky top-0 z-20">
        <tr>
          <th class="border border-border w-[8%] p-3 align-middle uppercase">ITEM</th>
          <th class="border border-border w-[42%] p-3 align-middle uppercase leading-tight">STANDAR TATA KELOLA<br />PERUSAHAAN</th>
          <th class="border border-border w-[15%] p-3 align-middle uppercase">IMPLEMENTASI</th>
          <th class="border border-border w-[15%] p-3 align-middle uppercase">EVIDENCE</th>
          <th class="border border-border w-[5%] p-3 align-middle uppercase leading-tight">STATUS<br />YES/NO</th>
          <th class="border border-border w-[15%] p-3 align-middle uppercase">REKOMENDASI</th>
        </tr>
      </thead>

      <!-- BODY -->
      <tbody class="align-top">
        {#if pagedQuestions.length > 0}
            <!-- Forced Headers Logic per Page -->
            {#each pagedQuestions as q, i}
                <!-- Show Level/Part header if it's the first question of the page OR if it changed from previous question -->
                {@const headers = getHeadersForQuestion(q.id)}
                {@const prevHeaders = i > 0 ? getHeadersForQuestion(pagedQuestions[i-1].id) : { level: null, part: null }}
                
                {#if i === 0 || headers.level?.label !== prevHeaders.level?.label}
                    <tr class="bg-[#f1f5f9]">
                        <td colspan="6" class="border border-border p-2 font-bold text-primary uppercase">
                            {headers.level?.label || 'LEVEL UNKNOWN'}
                        </td>
                    </tr>
                {/if}

                {#if i === 0 || headers.part?.id !== prevHeaders.part?.id}
                    <tr class="bg-slate-50/50">
                        <td class="border border-border p-2 font-bold bg-white align-middle text-center">
                            <div class="text-primary uppercase">{headers.part?.id || ''}</div>
                            <div class="text-accent uppercase text-[10px]">{headers.part?.name_id || ''}</div>
                        </td>
                        <td class="border border-border p-2 font-bold leading-tight align-top">
                             <div class="text-primary text-[10px] uppercase">{headers.part?.full_name_en || ''}</div>
                             <div class="text-accent text-[10px] uppercase">{headers.part?.full_name_id || ''}</div>
                        </td>
                        <td class="border border-border h-full bg-slate-50/20"></td>
                        <td class="border border-border h-full bg-slate-50/20"></td>
                        <td class="border border-border h-full bg-slate-50/20"></td>
                        <td class="border border-border h-full bg-slate-50/20"></td>
                    </tr>
                {/if}

                {@const sectionId = q.section}
                {@const prevSectionId = i > 0 ? pagedQuestions[i-1].section : null}
                {#if sectionId && (i === 0 || sectionId !== prevSectionId)}
                  {@const section = assessmentData.find(s => s.type === 'section' && s.id === sectionId)}
                  {#if section}
                    <tr class="bg-white">
                        <td class="border border-border p-2 font-bold text-primary align-middle text-center bg-slate-50/30">
                            {section.id}
                        </td>
                        <td class="border border-border p-2 font-bold leading-tight align-top">
                            <div class="text-primary text-[10px]">{section.name_en}</div>
                            <div class="text-accent text-[10px]">{section.name_id}</div>
                        </td>
                        <td class="border border-border"></td>
                        <td class="border border-border"></td>
                        <td class="border border-border"></td>
                        <td class="border border-border"></td>
                    </tr>
                  {/if}
                {/if}

                <!-- Subtitles Logic -->
                {#if i === 0 || q.id !== pagedQuestions[i-1].id}
                   {@const subtitle = assessmentData.find(s => s.type === 'subtitle' && s.id === q.id)}
                   {#if subtitle}
                     <tr class="bg-slate-50/20 italic">
                        <td class="border border-border p-2 text-center align-middle text-xs">...</td>
                        <td class="border border-border p-2 leading-tight">
                            <div class="text-primary text-[10px]">{subtitle.name_en}</div>
                            <div class="text-accent text-[10px]">{subtitle.name_id}</div>
                        </td>
                        <td class="border border-border"></td>
                        <td class="border border-border"></td>
                        <td class="border border-border"></td>
                        <td class="border border-border"></td>
                     </tr>
                   {/if}
                {/if}

                <!-- Question Row -->
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="border border-border p-2 align-middle text-center">
                    <span class="text-accent font-bold">{q.id}</span>
                  </td>
                  <td class="border border-border p-2 align-top leading-tight">
                    <div class="text-foreground mb-1 text-justify font-medium">{q.question_en}</div>
                    <div class="text-accent text-justify italic">{q.question_id}</div>
                  </td>
                  <td class="border border-border p-2 align-top">
                    <textarea 
                      class="w-full bg-slate-50 border border-slate-200 rounded p-2 min-h-[100px] text-[10px] focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                      placeholder="Input implementasi..."
                      value={q.implementation || ""}
                    ></textarea>
                  </td>
                  <td class="border border-border p-3 align-top">
                    <!-- Text Area with Floating Plus Button -->
                    <div class="relative group">
                      <textarea 
                        class="w-full bg-slate-50 border border-slate-200 rounded p-2 pr-10 min-h-[100px] text-[10px] focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none" 
                        placeholder="Klik untuk input keterangan bukti..."
                        value={q.evidence || ""}
                      ></textarea>
                      
                      <!-- Rounded Plus Button bottom right -->
                      <button 
                        type="button"
                        class="absolute bottom-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                        title="Unggah Dokumen"
                      >
                        <Plus size={18} strokeWidth={3} />
                      </button>
                    </div>

                    {#if q.evidence && q.evidence.includes('https')}
                       <div class="mt-1 flex items-center gap-1 text-[9px] text-[#0563c1] font-medium italic opacity-70 group-hover:opacity-100 transition-opacity">
                          🌐 Link sumber terdeteksi
                       </div>
                    {/if}
                  </td>
                  <td class="border border-border p-2 align-middle text-center">
                    <select 
                      class="bg-white border border-slate-200 rounded p-1 text-[10px] font-bold focus:ring-1 focus:ring-primary"
                      value={q.status === 'YES' ? 'Y' : q.status === 'NO' ? 'N' : q.status || ''}
                    >
                        <option value="">-</option>
                        <option value="Y" selected={q.status === 'YES' || q.status === 'Y'}>YES</option>
                        <option value="N" selected={q.status === 'NO' || q.status === 'N'}>NO</option>
                    </select>
                  </td>
                  <td class="border border-border p-2 align-top">
                    <textarea 
                      class="w-full bg-slate-50 border border-slate-200 rounded p-2 min-h-[100px] text-[10px] focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                      placeholder="Input rekomendasi..."
                      value={q.recommendation || ""}
                    ></textarea>
                  </td>
                </tr>
            {/each}
        {:else}
            <tr>
                <td colspan="6" class="p-12 text-center text-muted-foreground border border-border italic">
                    Data tidak ditemukan untuk pencarian "{searchQuery}"
                </td>
            </tr>
        {/if}
      </tbody>
    </table>
  </div>

  <!-- PAGINATION FOOTER -->
  <div class="flex flex-col md:flex-row items-center justify-between gap-4 py-2 text-slate-600 text-xs font-medium">
    <div class="flex items-center gap-2">
      <span>Baris per hlmn.</span>
      <select 
        class="border border-border rounded px-2 py-1 bg-white outline-none focus:ring-1 focus:ring-primary"
        bind:value={pageSize}
        onchange={() => currentPage = 1}
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
        onclick={() => currentPage = 1}
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
              class="h-8 w-8 {currentPage === page ? 'bg-[#ff7f50] hover:bg-[#ff7f50]/90 text-white' : ''}" 
              onclick={() => currentPage = page as number}
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
        onclick={() => currentPage = totalPages}
      >
        <ChevronsRight size={16} />
      </Button>
    </div>

    <div class="text-muted-foreground">
      {startIndex + 1}-{endIndex} dari {totalItems}
    </div>
  </div>
</div>
