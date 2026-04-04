<script lang="ts">
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
    Check,
    Cloud,
    Loader2,
    AlertCircle,
    X
  } from "@lucide/svelte";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import { upsertAnswer, createAssessment } from "./assessment-service.js";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";

  export interface AssessmentItem {
    type: string;
    level_label?: string;
    part_id?: string;
    section_id?: string;
    item_id?: string;
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
    level?: string; 
    part?: string;  
    section?: string; 
    id?: string; 
  }

  interface Props {
    assessmentData: AssessmentItem[];
    isLoading?: boolean;
    currentYear?: number;
    assessmentId?: string | null;
  }

  let { 
    assessmentData = [], 
    isLoading = false, 
    currentYear = new Date().getFullYear(),
    assessmentId = null
  }: Props = $props();

  // State
  let searchQuery = $state("");
  let pageSize = $state(15);
  let currentPage = $state(1);
  let syncStatus = $state<'saved' | 'saving' | 'error'>('saved');
  let stagedFiles = $state<Record<string, File>>({});

  // Year Filter State - Sync with prop
  // svelte-ignore state_referenced_locally
  let selectedYear = $state(currentYear.toString());
  $effect(() => {
    selectedYear = currentYear.toString();
  });
  
  let yearQuery = $state("");
  
  const years = $derived(() => {
    const list = [];
    const nowYear = new Date().getFullYear();
    for(let i = nowYear + 1; i >= nowYear - 10; i--) {
        list.push(i.toString());
    }
    if (yearQuery && !list.includes(yearQuery) && /^\d{4}$/.test(yearQuery)) {
        list.unshift(yearQuery);
    }
    return list.filter(y => y.includes(yearQuery));
  });

  // Effect to handle year change navigation
  $effect(() => {
    if (selectedYear !== currentYear.toString()) {
      goto(`?year=${selectedYear}`, { keepFocus: true, noScroll: true });
    }
  });

  // Auto-resize logic for textareas
  function autoResize(node: HTMLTextAreaElement) {
    function update() {
        node.style.height = 'auto';
        node.style.height = node.scrollHeight + 'px';
    }
    node.addEventListener('input', update);
    update();
    return {
        destroy() {
            node.removeEventListener('input', update);
        }
    };
  }

  // Handle Ctrl + Enter Save
  async function handleKeyDown(e: KeyboardEvent, q: AssessmentItem, field: string) {
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        await saveField(q, field, (e.target as HTMLTextAreaElement).value);
    }
  }

  async function saveField(q: AssessmentItem, field: string, value: string) {
    if (!q.id) return;
    
    let activeAssessmentId = assessmentId;
    
    // Create assessment header if it doesn't exist (Lazy creation)
    if (!activeAssessmentId) {
        syncStatus = 'saving';
        const { data, error } = await createAssessment(currentYear);
        if (error || !data) {
            syncStatus = 'error';
            toast.error("Gagal membuat data assessment tahun ini");
            return;
        }
        activeAssessmentId = data.id;
        // In real app, you'd update the parent state or re-fetch
    }

    syncStatus = 'saving';
    
    const { error } = await upsertAnswer({
        id: q.id as string,
        [field]: value 
    });

    if (error) {
        syncStatus = 'error';
        toast.error("Gagal menyimpan: " + error.message);
    } else {
        syncStatus = 'saved';
        (q as any)[field] = value;
    }
  }

  // File Upload Logic
  let fileInputs = $state<Record<string, HTMLInputElement>>({});

  function triggerFileInput(qId: string) {
    fileInputs[qId]?.click();
  }

  function handleFileSelect(e: Event, qId: string) {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
        stagedFiles[qId] = target.files[0];
    }
  }

  async function uploadStagedFile(q: AssessmentItem) {
    const file = stagedFiles[q.id as string];
    if (!file) return;

    syncStatus = 'saving';
    const { data: url, error } = await import('./assessment-service.js').then(m => m.uploadEvidence(file));
    
    if (error) {
        syncStatus = 'error';
        toast.error("Gagal upload: " + error.message);
        return;
    }

    if (url) {
        const newValue = (q.evidence ? q.evidence + "\n" : "") + url;
        await saveField(q, 'evidence', newValue);
        delete stagedFiles[q.id as string];
        toast.success("File berhasil diunggah");
    }
  }

  // Filtered data
  const filteredData = $derived(
    assessmentData.filter((item) => {
      if (item.type !== 'question') return false;
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const id = item.item_id || item.id || "";
      return (
        id.toLowerCase().includes(query) ||
        (item.question_en || "").toLowerCase().includes(query) ||
        (item.question_id || "").toLowerCase().includes(query)
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
  function getHeadersForQuestion(q: AssessmentItem) {
    const levelLabel = q.level_label || q.level;
    const partId = q.part_id || q.part;
    
    const level = assessmentData.find((item) => item.type === 'level' && item.label === levelLabel);
    const part = assessmentData.find((item) => item.type === 'part' && (item.item_id === partId || item.id === partId));
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
        <!-- SYNC STATUS -->
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-medium mr-2">
            {#if syncStatus === 'saved'}
                <Cloud size={14} class="text-emerald-500" />
                <span class="text-slate-600">Tersimpan</span>
            {:else if syncStatus === 'saving'}
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
        {#if isLoading}
          {#each Array(5) as _}
            <tr class="animate-pulse">
                <td class="border border-border p-4 text-center align-middle">
                    <Skeleton class="h-4 w-10 mx-auto" />
                </td>
                <td class="border border-border p-4">
                    <Skeleton class="h-4 w-3/4 mb-2" />
                    <Skeleton class="h-3 w-full mb-1" />
                    <Skeleton class="h-3 w-2/3" />
                </td>
                <td class="border border-border p-3">
                    <Skeleton class="h-24 w-full rounded-md" />
                </td>
                <td class="border border-border p-3">
                    <Skeleton class="h-24 w-full rounded-md" />
                </td>
                <td class="border border-border p-3 align-middle">
                    <Skeleton class="h-8 w-full rounded-md" />
                </td>
                <td class="border border-border p-3">
                    <Skeleton class="h-24 w-full rounded-md" />
                </td>
            </tr>
          {/each}
        {:else if pagedQuestions.length > 0}
            <!-- Forced Headers Logic per Page -->
            {#each pagedQuestions as q, i}
                <!-- Show Level/Part header if it's the first question of the page OR if it changed from previous question -->
                {@const headers = getHeadersForQuestion(q)}
                {@const prevHeaders = i > 0 ? getHeadersForQuestion(pagedQuestions[i-1]) : { level: null, part: null }}
                
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

                {@const sectionId = q.section_id || q.section}
                {@const prevSectionId = i > 0 ? (pagedQuestions[i-1].section_id || pagedQuestions[i-1].section) : null}
                {#if sectionId && (i === 0 || sectionId !== prevSectionId)}
                  {@const section = assessmentData.find(s => s.type === 'section' && (s.item_id === sectionId || s.id === sectionId))}
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
                {#if i === 0 || (q.item_id || q.id) !== (pagedQuestions[i-1].item_id || pagedQuestions[i-1].id)}
                   {@const subtitle = assessmentData.find(s => s.type === 'subtitle' && (s.item_id === (q.item_id || q.id) || s.id === (q.item_id || q.id)))}
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
                    <span class="text-accent font-bold">{q.item_id || q.id}</span>
                  </td>
                  <td class="border border-border p-2 align-top leading-tight">
                    <div class="text-foreground mb-1 text-justify font-medium">{q.question_en}</div>
                    <div class="text-accent text-justify italic">{q.question_id}</div>
                  </td>
                  <td class="border border-border p-2 align-top">
                    <textarea 
                      use:autoResize
                      class="w-full bg-slate-50 border border-slate-200 rounded p-2 min-h-[100px] text-[10px] focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none overflow-hidden" 
                      placeholder="Input implementasi... (Ctrl + Enter untuk simpan)"
                      value={q.implementation || ""}
                      onkeydown={(e) => handleKeyDown(e, q, 'implementation')}
                    ></textarea>
                  </td>
                  <td class="border border-border p-3 align-top">
                    <!-- Text Area with Floating Plus Button -->
                    <div class="relative group">
                      <textarea 
                        use:autoResize
                        class="w-full bg-slate-50 border border-slate-200 rounded p-2 pr-10 min-h-[100px] text-[10px] focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none overflow-hidden" 
                        placeholder="Klik untuk input keterangan bukti... (Ctrl + Enter untuk simpan)"
                        value={q.evidence || ""}
                        onkeydown={(e) => handleKeyDown(e, q, 'evidence')}
                      ></textarea>
                      
                      <!-- Hidden File Input -->
                      <input 
                        type="file" 
                        class="hidden" 
                        bind:this={fileInputs[q.id as string]}
                        onchange={(e) => handleFileSelect(e, q.id as string)}
                      />

                      <!-- Rounded Plus Button bottom right -->
                      <button 
                        type="button"
                        class="absolute bottom-2 right-2 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                        title="Unggah Dokumen"
                        onclick={() => triggerFileInput(q.id as string)}
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>

                    {#if stagedFiles[q.id as string]}
                       <div class="mt-2 p-2 rounded bg-amber-50 border border-amber-200 flex flex-col gap-2">
                          <div class="flex items-center justify-between text-[9px] font-bold text-amber-800">
                             <div class="truncate max-w-[80px]">📎 {stagedFiles[q.id as string].name}</div>
                             <button 
                                class="text-rose-500 hover:text-rose-700" 
                                onclick={() => delete stagedFiles[q.id as string]}
                             >
                                <X size={12} />
                             </button>
                          </div>
                          <Button 
                             size="sm" 
                             class="h-6 text-[9px] bg-amber-600 hover:bg-amber-700 text-white w-full"
                             onclick={() => uploadStagedFile(q)}
                          >
                             Submit File
                          </Button>
                       </div>
                    {/if}

                    {#if q.evidence && q.evidence.includes('http')}
                       <div class="mt-1.5">
                          <a 
                            href={q.evidence} 
                            target="_blank" 
                            class="flex items-center gap-1 text-[9px] text-blue-600 font-medium hover:underline bg-blue-50 w-fit px-1.5 py-0.5 rounded border border-blue-100"
                          >
                             🌐 Lihat Bukti
                          </a>
                       </div>
                    {/if}
                  </td>
                  <td class="border border-border p-2 align-middle text-center">
                    <div class="flex flex-col gap-1 items-center">
                        <button 
                            class="w-10 py-1 rounded text-[9px] font-bold transition-all {q.status === 'YES' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}"
                            onclick={() => saveField(q, 'status', 'YES')}
                        >
                            YES
                        </button>
                        <button 
                            class="w-10 py-1 rounded text-[9px] font-bold transition-all {q.status === 'NO' ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}"
                            onclick={() => saveField(q, 'status', 'NO')}
                        >
                            NO
                        </button>
                        <button 
                            class="w-10 py-1 rounded text-[9px] font-bold transition-all {q.status === 'NA' ? 'bg-slate-400 text-white shadow-sm' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}"
                            onclick={() => saveField(q, 'status', 'NA')}
                        >
                            NA
                        </button>
                    </div>
                  </td>
                  <td class="border border-border p-2 align-top">
                    <textarea 
                      use:autoResize
                      class="w-full bg-slate-50 border border-slate-200 rounded p-2 min-h-[100px] text-[10px] focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none overflow-hidden" 
                      placeholder="Input rekomendasi... (Ctrl + Enter untuk simpan)"
                      value={q.recommendation || ""}
                      onkeydown={(e) => handleKeyDown(e, q, 'recommendation')}
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
