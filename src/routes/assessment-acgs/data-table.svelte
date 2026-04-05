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
    Plus,
    Calendar,
    Check,
    Cloud,
    Loader2,
    AlertCircle,
    X
  } from "@lucide/svelte";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import {
    upsertAnswer,
    uploadEvidence,
    type UpsertAnswerInput
  } from "./assessment-service.js";
  import {
    canonicalPartIdForAcgsQuestion,
    canonicalSectionIdForAcgsQuestion,
    isAcgsQuestionRow
  } from "./acgs-defaults.js";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { toast } from "svelte-sonner";

  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const SEARCH_DEBOUNCE_MS = 350;
  let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined;

  function norm(s: string | null | undefined) {
    return (s ?? "").replace(/\s+/g, " ").trim();
  }

  /** Prefer human-readable codes (PART A, A.1.1); never show raw row UUID in the grid. */
  function displayCode(primary?: string | null, fallback?: string | null) {
    const p = norm(primary);
    if (p && !UUID_RE.test(p)) return p;
    const f = norm(fallback);
    if (f && !UUID_RE.test(f)) return f;
    return p || f || "";
  }

  function partGroupKey(row: AssessmentItem | null | undefined) {
    if (!row) return "";
    return norm(row.item_id || row.part_id || row.label || "");
  }

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
    question_en?: string;
    question_id?: string;
    implementation?: string;
    evidence?: string;
    status?: string;
    recommendation?: string;
    level?: string;
    part?: string;
    section?: string;
    uid?: string;
    id?: string;
    row_uid?: string;
    sort_order?: number | null;
    /** Subtitle terakhir sebelum baris ini (dari server, urutan master/DB). */
    acgs_subtitle_context?: { name_en?: string | null; name_id?: string | null } | null;
    /** Diisi server (`attachResolvedAcgsHeaders`); klien tidak import master. */
    acgs_resolved_level?: { label?: string | null } | null;
    acgs_resolved_part?: {
      item_id?: string | null;
      id?: string | null;
      part_id?: string | null;
      name_id?: string | null;
      full_name_en?: string | null;
      full_name_id?: string | null;
    } | null;
    acgs_resolved_section?: {
      item_id?: string | null;
      id?: string | null;
      name_en?: string | null;
      name_id?: string | null;
    } | null;
  }

  interface Props {
    /** Seluruh pertanyaan tahun dari `load` (filter teks di klien). */
    initialQuestions?: AssessmentItem[];
    /** Baris struktur untuk fallback subtitle/header jika tidak ada field server (biasanya []). */
    structureFallbackData?: AssessmentItem[];
    serverSearch?: string;
    isLoading?: boolean;
    currentYear?: number;
    availableYears?: number[];
  }

  let {
    initialQuestions = [],
    structureFallbackData = [],
    serverSearch = "",
    isLoading = false,
    currentYear = new Date().getFullYear(),
    availableYears = []
  }: Props = $props();

  let searchQuery = $state("");
  /** Teks filter setelah debounce — dipakai untuk slice tabel (bukan `fetch`). */
  let debouncedFilterText = $state("");

  $effect(() => {
    searchQuery = serverSearch;
    debouncedFilterText = serverSearch.trim();
  });

  $effect(() => {
    return () => {
      if (searchDebounceTimer !== undefined) clearTimeout(searchDebounceTimer);
    };
  });

  let pageSize = $state(15);
  let currentPage = $state(1);

  $effect(() => {
    initialQuestions;
    currentPage = 1;
  });

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
    const nowYear = new Date().getFullYear();
    const fromDb = [...availableYears].sort((a, b) => b - a).map((y) => String(y));
    const sliding = Array.from({ length: 18 }, (_, i) => String(nowYear + 1 - i));
    const merged = [...new Set([...fromDb, ...sliding])];
    merged.sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
    const cy = String(currentYear);
    if (!merged.includes(cy)) merged.unshift(cy);
    merged.sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
    if (yearQuery && !merged.includes(yearQuery) && /^\d{4}$/.test(yearQuery)) {
      merged.unshift(yearQuery);
    }
    return merged.filter((y) => y.includes(yearQuery));
  });

  // Effect to handle year change navigation
  $effect(() => {
    if (selectedYear !== currentYear.toString()) {
      if (searchDebounceTimer !== undefined) clearTimeout(searchDebounceTimer);
      searchDebounceTimer = undefined;
      const q = encodeURIComponent(searchQuery.trim());
      goto(`${resolve("/assessment-acgs")}?year=${selectedYear}&q=${q}`, {
        keepFocus: true,
        noScroll: true
      });
    }
  });

  function scheduleSearchDebounce() {
    if (!browser) return;
    if (searchDebounceTimer !== undefined) clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      searchDebounceTimer = undefined;
      debouncedFilterText = searchQuery.trim();
      currentPage = 1;
    }, SEARCH_DEBOUNCE_MS);
  }

  function rowKeyOf(q: AssessmentItem) {
    return (q.row_uid || q.uid || q.id) as string | undefined;
  }

  /** Indeks praproses untuk filter klien (sama bidang seperti FTS server). */
  function buildSearchHaystack(q: AssessmentItem): string {
    return [norm(q.item_id), norm(q.question_en), norm(q.question_id), norm(q.label)]
      .join(" ")
      .toLowerCase();
  }

  const allTableQuestions = $derived(
    initialQuestions.filter((item) => isAcgsQuestionRow(item)) as AssessmentItem[]
  );

  const searchIndexByKey = $derived.by(() => {
    const m = new Map<string, string>();
    for (const q of allTableQuestions) {
      const k = rowKeyOf(q);
      if (k) m.set(k, buildSearchHaystack(q));
    }
    return m;
  });

  const filteredTableQuestions = $derived.by(() => {
    const raw = debouncedFilterText.trim().toLowerCase();
    if (!raw) return allTableQuestions;
    const tokens = raw.split(/\s+/).filter(Boolean);
    return allTableQuestions.filter((row) => {
      const k = rowKeyOf(row);
      const h = k ? (searchIndexByKey.get(k) ?? "") : "";
      return tokens.every((t) => h.includes(t));
    });
  });

  function applyServerSearch() {
    if (browser && searchDebounceTimer !== undefined) {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = undefined;
    }
    debouncedFilterText = searchQuery.trim();
    currentPage = 1;
    const y = currentYear;
    const q = encodeURIComponent(searchQuery.trim());
    goto(`${resolve("/assessment-acgs")}?year=${y}&q=${q}`, { keepFocus: true, noScroll: true });
  }

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
    const rowKey = rowKeyOf(q);
    if (!rowKey) {
      toast.error("Tidak ada data assessment untuk tahun ini. Jalankan seed/migrasi lalu muat ulang halaman.");
      return;
    }

    syncStatus = "saving";

    const { error } = await upsertAnswer({
      row_uid: rowKey,
      [field]: value
    } as UpsertAnswerInput);

    if (error) {
      syncStatus = "error";
      toast.error("Gagal menyimpan: " + error.message);
    } else {
      syncStatus = "saved";
      if (field === "implementation") q.implementation = value;
      else if (field === "evidence") q.evidence = value;
      else if (field === "recommendation") q.recommendation = value;
      else if (field === "status") q.status = value;
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
    const file = stagedFiles[rowKeyOf(q) ?? ""];
    if (!file) return;

    syncStatus = 'saving';
    const { data: url, error } = await uploadEvidence(file);
    
    if (error) {
        syncStatus = 'error';
        toast.error("Gagal upload: " + error.message);
        return;
    }

    if (url) {
        const newValue = (q.evidence ? q.evidence + "\n" : "") + url;
        await saveField(q, 'evidence', newValue);
        delete stagedFiles[rowKeyOf(q) ?? ""];
        toast.success("File berhasil diunggah");
    }
  }

  const tableQuestions = $derived(filteredTableQuestions);

  const totalItems = $derived(tableQuestions.length);
  const totalPages = $derived(Math.max(1, Math.ceil(totalItems / pageSize)));
  const startIndex = $derived((currentPage - 1) * pageSize);
  const endIndex = $derived(Math.min(startIndex + pageSize, totalItems));

  const pagedQuestions = $derived(tableQuestions.slice(startIndex, endIndex));

  const questionSubtitle = $derived.by(() => {
    const map = new Map<string, AssessmentItem | null>();
    let lastSub: AssessmentItem | null = null;
    for (const row of structureFallbackData) {
      if (row.type === "subtitle") lastSub = row;
      else if (isAcgsQuestionRow(row)) {
        const k = rowKeyOf(row);
        if (k) map.set(k, lastSub);
      }
    }
    return map;
  });

  function subtitleKey(s: AssessmentItem | null): string {
    if (!s) return "";
    return `${norm(s.name_en)}|${norm(s.name_id)}`;
  }

  function subtitleRowFor(q: AssessmentItem): AssessmentItem | null {
    const ctx = q.acgs_subtitle_context;
    if (ctx !== undefined) {
      if (!ctx || (!norm(ctx.name_en) && !norm(ctx.name_id))) return null;
      return {
        type: "subtitle",
        name_en: ctx.name_en ?? undefined,
        name_id: ctx.name_id ?? undefined
      } as AssessmentItem;
    }
    const k = rowKeyOf(q);
    if (!k) return null;
    return questionSubtitle.get(k) ?? null;
  }

  function hasServerResolvedHeaders(q: AssessmentItem): boolean {
    return isAcgsQuestionRow(q) && "acgs_resolved_level" in q;
  }

  /** Fallback DB-only (tanpa master) jika payload belum berisi `acgs_resolved_*`. */
  function effectiveLevelLabelDbOnly(q: AssessmentItem): string {
    return norm(q.level_label || q.level);
  }

  function getHeadersForQuestion(q: AssessmentItem) {
    if (hasServerResolvedHeaders(q)) {
      const lvl = q.acgs_resolved_level;
      const prt = q.acgs_resolved_part;
      return {
        level: lvl ? { label: lvl.label ?? undefined } : null,
        part: prt
          ? ({
              item_id: prt.item_id ?? undefined,
              id: prt.id ?? undefined,
              part_id: prt.part_id ?? undefined,
              name_id: prt.name_id ?? undefined,
              full_name_en: prt.full_name_en ?? undefined,
              full_name_id: prt.full_name_id ?? undefined
            } as AssessmentItem)
          : null
      };
    }

    const levelLabel = effectiveLevelLabelDbOnly(q);
    const partCanon = canonicalPartIdForAcgsQuestion(q);
    const level = structureFallbackData.find(
      (item) => item.type === "level" && norm(item.label) === levelLabel
    );
    const part = structureFallbackData.find((item) => {
      if (item.type !== "part") return false;
      const code = norm(item.item_id || item.part_id || item.label || item.id);
      return code === norm(partCanon);
    });
    return { level, part };
  }

  function findSectionRow(q: AssessmentItem) {
    if (hasServerResolvedHeaders(q)) {
      const s = q.acgs_resolved_section;
      if (!s) return undefined;
      return {
        type: "section",
        item_id: s.item_id ?? undefined,
        id: s.id ?? undefined,
        name_en: s.name_en ?? undefined,
        name_id: s.name_id ?? undefined
      } as AssessmentItem;
    }

    const sid = canonicalSectionIdForAcgsQuestion(q);
    if (!norm(sid)) return undefined;
    return structureFallbackData.find(
      (row) =>
        row.type === "section" &&
        (norm(row.item_id || row.id) === norm(sid) ||
          norm(row.section_id || row.section) === norm(sid))
    );
  }

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
    <form
      class="relative w-full md:w-96 flex gap-2"
      onsubmit={(e) => {
        e.preventDefault();
        applyServerSearch();
      }}
    >
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input
          placeholder="Filter lokal (debounce) — Enter: simpan ke URL…"
          class="pl-10 border-border focus:ring-primary"
          bind:value={searchQuery}
          oninput={() => scheduleSearchDebounce()}
        />
      </div>
      <Button type="submit" variant="secondary" size="sm" class="shrink-0">Cari</Button>
    </form>
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
          <th class="border border-border w-[42%] p-3 align-middle uppercase leading-tight">
            STANDAR TATA KELOLA<br />PERUSAHAAN
          </th>
          <th class="border border-border w-[15%] p-3 align-middle uppercase">IMPLEMENTASI</th>
          <th class="border border-border w-[15%] p-3 align-middle uppercase">EVIDENCE</th>
          <th class="border border-border w-[5%] p-3 align-middle uppercase leading-tight">STATUS<br />YES OR NO</th>
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
                
                {#if i === 0 || norm(headers.level?.label) !== norm(prevHeaders.level?.label)}
                    <tr class="bg-[#e2e8f0]">
                        <td class="border border-border p-2 font-bold text-slate-900 uppercase align-middle text-center">
                            {norm(headers.level?.label) || "LEVEL UNKNOWN"}
                        </td>
                        <td class="border border-border bg-[#e2e8f0]"></td>
                        <td class="border border-border bg-[#e2e8f0]"></td>
                        <td class="border border-border bg-[#e2e8f0]"></td>
                        <td class="border border-border bg-[#e2e8f0]"></td>
                        <td class="border border-border bg-[#e2e8f0]"></td>
                    </tr>
                {/if}

                {#if i === 0 || partGroupKey(headers.part) !== partGroupKey(prevHeaders.part)}
                    <tr class="bg-slate-50/50">
                        <td class="border border-border p-2 font-bold bg-white align-middle text-center">
                            <div class="text-slate-900 uppercase">{displayCode(headers.part?.item_id ?? headers.part?.id, headers.part?.part_id)}</div>
                            <div class="text-blue-700 uppercase text-[10px]">{norm(headers.part?.name_id)}</div>
                        </td>
                        <td class="border border-border p-2 font-bold leading-tight align-top text-left">
                             <div class="text-slate-900 text-[10px] md:text-[11px] uppercase">{norm(headers.part?.full_name_en)}</div>
                             <div class="text-blue-700 text-[10px] md:text-[11px] uppercase mt-1">{norm(headers.part?.full_name_id)}</div>
                        </td>
                        <td class="border border-border h-full bg-slate-50/20"></td>
                        <td class="border border-border h-full bg-slate-50/20"></td>
                        <td class="border border-border h-full bg-slate-50/20"></td>
                        <td class="border border-border h-full bg-slate-50/20"></td>
                    </tr>
                {/if}

                {@const sectionCanon = canonicalSectionIdForAcgsQuestion(q)}
                {@const prevSectionCanon =
                  i > 0 ? canonicalSectionIdForAcgsQuestion(pagedQuestions[i - 1]) : ""}
                {#if norm(sectionCanon) && (i === 0 || norm(sectionCanon) !== norm(prevSectionCanon))}
                  {@const section = findSectionRow(q)}
                  {#if section}
                    <tr class="bg-white">
                        <td class="border border-border p-2 font-bold text-slate-900 align-middle text-center bg-slate-50/30">
                            {displayCode(section.item_id, section.id)}
                        </td>
                        <td class="border border-border p-2 leading-tight align-top text-left">
                            <div class="text-slate-900 text-[11px] md:text-xs font-bold">{norm(section.name_en)}</div>
                            <div class="text-blue-700 text-[10px] md:text-[11px] mt-1 font-normal">{norm(section.name_id)}</div>
                        </td>
                        <td class="border border-border"></td>
                        <td class="border border-border"></td>
                        <td class="border border-border"></td>
                        <td class="border border-border"></td>
                    </tr>
                  {/if}
                {/if}

                <!-- Subtitles Logic -->
                {@const subRow = subtitleRowFor(q)}
                {@const prevSubRow = i > 0 ? subtitleRowFor(pagedQuestions[i - 1]) : null}
                {#if subRow && (i === 0 || subtitleKey(subRow) !== subtitleKey(prevSubRow))}
                   {@const subtitle = subRow}
                   {#if subtitle && (norm(subtitle.name_en) || norm(subtitle.name_id))}
                     <tr class="bg-primary/5">
                        <td class="border border-border w-[8%] p-2 align-top bg-primary/5"></td>
                        <td class="border border-border w-[42%] p-3 align-top leading-tight text-left">
                          {#if norm(subtitle.name_en)}
                            <div class="text-slate-900 text-[10px] font-bold mb-2">{norm(subtitle.name_en)}</div>
                          {/if}
                          {#if norm(subtitle.name_id)}
                            <div class="text-blue-700 text-[10px] font-bold leading-snug">{norm(subtitle.name_id)}</div>
                          {/if}
                        </td>
                        <td class="border border-border"></td>
                        <td class="border border-border"></td>
                        <td class="border border-border"></td>
                        <td class="border border-border"></td>
                     </tr>
                   {/if}
                {/if}

                <!-- Question: ITEM kosong; kode di sub-kolom STANDAR (biru), teks EN/ID di samping -->
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="border border-border p-2 align-middle bg-white"></td>
                  <td class="border border-border p-0 align-stretch">
                    <div class="flex min-h-full w-full">
                      <div
                        class="w-[3.25rem] md:w-[4.25rem] shrink-0 border-r border-border p-2 align-top text-center font-bold text-blue-700 text-[10px] md:text-[11px] leading-snug"
                      >
                        {displayCode(q.item_id, null)}
                      </div>
                      <div class="min-w-0 flex-1 p-2 align-top leading-tight text-left">
                        <div class="text-slate-900 mb-1 text-justify font-medium text-[11px] md:text-xs">{norm(q.question_en)}</div>
                        <div class="text-blue-700 text-justify text-[10px] md:text-[11px] leading-snug font-normal">{norm(q.question_id)}</div>
                      </div>
                    </div>
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
                        bind:this={fileInputs[rowKeyOf(q) ?? ""]}
                        onchange={(e) => handleFileSelect(e, rowKeyOf(q) ?? "")}
                      />

                      <!-- Rounded Plus Button bottom right -->
                      <button 
                        type="button"
                        class="absolute bottom-2 right-2 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                        title="Unggah Dokumen"
                        onclick={() => triggerFileInput(rowKeyOf(q) ?? "")}
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>

                    {#if stagedFiles[rowKeyOf(q) ?? ""]}
                       <div class="mt-2 p-2 rounded bg-amber-50 border border-amber-200 flex flex-col gap-2">
                          <div class="flex items-center justify-between text-[9px] font-bold text-amber-800">
                             <div class="truncate max-w-[80px]">📎 {stagedFiles[rowKeyOf(q) ?? ""].name}</div>
                             <button 
                                class="text-rose-500 hover:text-rose-700" 
                                onclick={() => delete stagedFiles[rowKeyOf(q) ?? ""]}
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
                  {#if debouncedFilterText.trim()}
                    Tidak ada pertanyaan untuk filter "{debouncedFilterText.trim()}".
                  {:else}
                    Belum ada pertanyaan dimuat untuk tahun ini.
                  {/if}
                </td>
            </tr>
        {/if}
      </tbody>
    </table>
  </div>

  <!-- PAGINATION FOOTER -->
  <div class="flex flex-col gap-3 py-2 text-slate-600 text-xs font-medium">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span class="text-muted-foreground">
        {#if debouncedFilterText.trim()}
          <strong>{tableQuestions.length}</strong> cocok filter dari
          <strong>{allTableQuestions.length}</strong> pertanyaan (tahun {currentYear})
          <span class="italic">— "{debouncedFilterText.trim()}"</span>
        {:else}
          <strong>{allTableQuestions.length}</strong> pertanyaan (tahun {currentYear}), tampilan per halaman {pageSize}
        {/if}
      </span>
    </div>
    <div class="flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-2">
      <span>Baris tampilan per halaman</span>
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
      Tampilan {totalItems > 0 ? startIndex + 1 : 0}-{endIndex} dari {totalItems} terunduh
    </div>
    </div>
  </div>
</div>
