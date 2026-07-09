<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import {
    deleteEncryptedPageCache,
    deleteEncryptedPageCacheByRoute,
    type PageCacheScope
  } from "$lib/client/encrypted-page-cache.js";
  import { extractEvidenceFiles, extractEvidenceText, reconstructEvidence } from "$lib/evidence-utils.js";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import { toast } from "svelte-sonner";

  // Components
  import TableToolbar from "./table-toolbar.svelte";
  import TablePagination from "./table-pagination.svelte";
  import StatusButtons from "./status-buttons.svelte";
  import EvidenceCell from "./evidence-cell.svelte";
  import EditableCell from "./editable-cell.svelte";
  import ItemPreviewHoverCard from "./item-preview-hover-card.svelte";
  import ScoreSummaryTable from "./score-summary-table.svelte";

  // Lib & Utils
  import type { AssessmentItem } from "../_lib/types.js";
  import { saveAssessmentField, uploadEvidenceWithSignedUrl, deleteEvidenceFile } from "../_lib/assessment-api-client.js";
  import { canonicalPartIdForAcgsQuestion, canonicalSectionIdForAcgsQuestion, isAcgsQuestionRow, norm } from "../_lib/acgs-question-utils.js";
  import { canKeepRecommendationForAssessmentItem } from "../_lib/recommendation-rules.js";
  import { buildSearchHaystack } from "../_lib/search-utils.js";
  import { saveScrollPosition, restoreScrollPosition, initScrollTracking } from "../_lib/actions.js";

  // Restore scroll position after page refresh and init debounced tracker
  $effect(() => {
    restoreScrollPosition();
    const cleanup = initScrollTracking();
    return cleanup;
  });


  interface Props {
    initialQuestions?: AssessmentItem[];
    structureFallbackData?: AssessmentItem[];
    serverSearch?: string;
    isLoading?: boolean;
    currentYear?: number;
    availableYears?: number[];
    canRecompute?: boolean;
    cacheKey?: string;
    cacheScope?: PageCacheScope;
  }

  let {
    initialQuestions = [],
    structureFallbackData = [],
    serverSearch = "",
    isLoading = false,
    currentYear = new Date().getFullYear(),
    availableYears = [],
    canRecompute = false,
    cacheKey,
    cacheScope,
  }: Props = $props();

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const MAX_EVIDENCE_BYTES = 15 * 1024 * 1024;
  const ALLOWED_EVIDENCE_EXTS = new Set(["pdf", "png", "jpg", "jpeg", "webp"]);
  const ALLOWED_EVIDENCE_MIME_BY_EXT: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp"
  };

  // Search & Filter State
  let searchQuery = $state("");
  let debouncedFilterText = $state("");
  const SEARCH_DEBOUNCE_MS = 350;
  let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    searchQuery = serverSearch;
    debouncedFilterText = serverSearch.trim();
  });

  // Year Selection
  let selectedYear = $state("");
  
  $effect(() => {
    if (!selectedYear && currentYear) {
      selectedYear = currentYear.toString();
    }
  });

  $effect(() => {
    if (selectedYear && selectedYear !== currentYear.toString()) {
      const q = encodeURIComponent(searchQuery.trim());
      goto(`${resolve("/assessment-acgs")}?year=${selectedYear}&q=${q}`, {
        keepFocus: true,
        noScroll: true,
      });
    }
  });

  // UI State
  let syncStatus = $state<"saved" | "saving" | "error">("saved");
  let stagedFiles = $state<Record<string, File>>({});
  let pageSize = $state(15);
  let currentPage = $state(1);

  let lastYear: number | undefined = undefined;
  let lastSearch: string | undefined = undefined;
  
  $effect(() => {
    if (lastYear !== undefined && lastSearch !== undefined) {
      if (currentYear !== lastYear || serverSearch !== lastSearch) {
        currentPage = 1;
      }
    }
    lastYear = currentYear;
    lastSearch = serverSearch;
  });

  // Core Data Functions
  function rowKeyOf(q: AssessmentItem): string | undefined {
    return q.row_uid || q.answer_uid || q.item_uid || q.uid || q.id;
  }

  function itemUidOf(q: AssessmentItem): string | undefined {
    return q.item_uid || q.uid;
  }

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

  function normalizedStatus(q: AssessmentItem): string {
    const status = String(q.status ?? "").trim().toUpperCase();
    if (status === "Y") return "YES";
    if (status === "N") return "NO";
    return status;
  }

  function recommendationDisabled(q: AssessmentItem): boolean {
    if (canKeepRecommendationForAssessmentItem(currentYear, q)) return false;
    const status = normalizedStatus(q);
    return status === "YES" || status === "NA";
  }

  function validateEvidenceFile(file: File): string | null {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const fileType = file.type || "application/octet-stream";
    if (file.size <= 0) return "File bukti tidak boleh kosong.";
    if (file.size > MAX_EVIDENCE_BYTES) return "Ukuran file bukti maksimal 15 MB.";
    if (!ALLOWED_EVIDENCE_EXTS.has(ext)) return "Ekstensi file tidak didukung. Unggah PDF, JPG, PNG, atau WEBP.";
    if (fileType.toLowerCase() !== ALLOWED_EVIDENCE_MIME_BY_EXT[ext]) return "Tipe file tidak sesuai dengan ekstensi.";
    return null;
  }

  async function invalidateRelatedCaches(): Promise<void> {
    if (cacheKey) await deleteEncryptedPageCache(cacheKey);
    if (!cacheScope) return;
    await Promise.all([
      deleteEncryptedPageCacheByRoute(cacheScope, "/assessment-acgs"),
      deleteEncryptedPageCacheByRoute(cacheScope, "/area-of-improvement"),
      deleteEncryptedPageCacheByRoute(cacheScope, "/monitoring-aoi")
    ]);
  }

  // Wrap the prop in $state so it becomes deeply reactive (making optimistic UI work instantly)
  let localQuestions = $state<AssessmentItem[]>([]);
  $effect(() => {
    // Deep proxy magic from Svelte 5
    localQuestions = initialQuestions; 
  });

  // Reactive Derived Lists
  const allTableQuestions = $derived(
    localQuestions.filter((item) => isAcgsQuestionRow(item)) as AssessmentItem[],
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

  const pagedQuestions = $derived(filteredTableQuestions.slice((currentPage - 1) * pageSize, currentPage * pageSize));

  // Async Operations
  async function persistField(q: AssessmentItem, field: string, value: string): Promise<boolean> {
    const rowKey = rowKeyOf(q);
    if (!rowKey) return false;
    
    // Optimistic Update for instant UI
    const prevImpl = q.implementation;
    const prevEvid = q.evidence;
    const prevRec = q.recommendation;
    const prevStatus = q.status;
    const statusValue = field === "status" ? value.trim().toUpperCase() : "";
    const shouldClearRecommendation =
      field === "status" &&
      (statusValue === "YES" || statusValue === "NA") &&
      !canKeepRecommendationForAssessmentItem(currentYear, q);
    
    if (field === "implementation") q.implementation = value;
    else if (field === "evidence") q.evidence = value;
    else if (field === "recommendation") q.recommendation = value;
    else if (field === "status") {
      q.status = value;
      if (shouldClearRecommendation) q.recommendation = "";
    }

    syncStatus = "saving";
    const { data, error } = await saveAssessmentField(rowKey, field, value, {
      year: currentYear,
      itemUid: itemUidOf(q)
    });
    if (error) {
      syncStatus = "error";
      toast.error("Gagal menyimpan: " + error.message);
      // Revert if error
      if (field === "implementation") q.implementation = prevImpl;
      else if (field === "evidence") q.evidence = prevEvid;
      else if (field === "recommendation") q.recommendation = prevRec;
      else if (field === "status") q.status = prevStatus;
      q.recommendation = prevRec;
      return false;
    } else {
      if (data?.answerUid) {
        q.answer_uid = data.answerUid;
        q.row_uid = data.answerUid;
      }
      await invalidateRelatedCaches();
      syncStatus = "saved";
      return true;
    }
  }

  async function saveField(q: AssessmentItem, field: string, value: string): Promise<void> {
    await persistField(q, field, value);
  }

  async function handleFileUpload(q: AssessmentItem, file: File) {
    syncStatus = "saving";
    const code = norm(q.item_id) || "unknown";
    const { data: uploaded, error } = await uploadEvidenceWithSignedUrl(file, {
      year: currentYear,
      questionCode: code,
    });
    if (error) {
      syncStatus = "error";
      toast.error("Gagal upload: " + error.message);
      return;
    }
    if (uploaded) {
      const text = extractEvidenceText(q.evidence);
      const files = extractEvidenceFiles(q.evidence);
      const nextEvidence = reconstructEvidence(text, [
        ...files,
        { path: uploaded.path, name: uploaded.name }
      ]);
      const saved = await persistField(q, "evidence", nextEvidence);
      if (!saved) {
        await deleteEvidenceFile(uploaded.path);
        toast.error("Upload dibatalkan karena evidence gagal disimpan.");
        return;
      }
      const rk = rowKeyOf(q) ?? "";
      const { [rk]: _, ...rest } = stagedFiles;
      stagedFiles = rest;
      toast.success("File berhasil diunggah");
    }
  }

  async function handleRemoveFile(q: AssessmentItem, index: number) {
     if (!confirm("Apakah Anda yakin ingin menghapus file bukti ini?")) return;
     // The files are already removed from q.evidence in child before calling this? 
     // No, the child should call this as a request.
     // Re-implementing simplified logic here.
     const { extractEvidenceText, extractEvidenceFiles, reconstructEvidence } = await import("$lib/evidence-utils.js");
     
     const text = extractEvidenceText(q.evidence);
     const files = extractEvidenceFiles(q.evidence);
     const fileToDelete = files[index];

     if (fileToDelete?.path) {
        syncStatus = "saving";
        const { error } = await deleteEvidenceFile(fileToDelete.path);
        if (error) {
            syncStatus = "error";
            toast.error("Gagal hapus di cloud: " + error.message);
            return;
        }
     }
     files.splice(index, 1);
     const newValue = reconstructEvidence(text, files);
     await saveField(q, "evidence", newValue);
  }

  // Event Handlers for Toolbar
  function handleSearchInput() {
    if (searchDebounceTimer !== undefined) clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        debouncedFilterText = searchQuery.trim();
        currentPage = 1;
    }, SEARCH_DEBOUNCE_MS);
  }

  function handleFullSearch() {
    debouncedFilterText = searchQuery.trim();
    currentPage = 1;
    const q = encodeURIComponent(searchQuery.trim());
    goto(`${resolve("/assessment-acgs")}?year=${currentYear}&q=${q}`, { keepFocus: true, noScroll: true });
  }

  // Header Logic Helpers
  function hasServerResolvedHeaders(q: AssessmentItem) {
    return isAcgsQuestionRow(q) && "acgs_resolved_level" in q;
  }

  function getHeadersForQuestion(q: AssessmentItem) {
    if (hasServerResolvedHeaders(q)) {
      const lvl = q.acgs_resolved_level;
      const prt = q.acgs_resolved_part;
      return {
        level: lvl ? { label: lvl.label ?? undefined } : null,
        part: prt ? ({ item_id: prt.item_id ?? undefined, id: prt.id ?? undefined, part_id: prt.part_id ?? undefined, name_id: prt.name_id ?? undefined, full_name_en: prt.full_name_en ?? undefined, full_name_id: prt.full_name_id ?? undefined } as AssessmentItem) : null
      };
    }
    const levelLabel = norm(q.level_label || q.level);
    const partCanon = canonicalPartIdForAcgsQuestion(q);
    const level = structureFallbackData.find(i => i.type === "level" && norm(i.label) === levelLabel);
    const part = structureFallbackData.find(i => i.type === "part" && norm(i.item_id || i.part_id || i.label || i.id) === norm(partCanon));
    return { level, part };
  }

  function findSectionRow(q: AssessmentItem) {
    if (hasServerResolvedHeaders(q)) {
      const s = q.acgs_resolved_section;
      if (!s) return undefined;
      return { type: "section", item_id: s.item_id ?? undefined, id: s.id ?? undefined, name_en: s.name_en ?? undefined, name_id: s.name_id ?? undefined } as AssessmentItem;
    }
    const sid = canonicalSectionIdForAcgsQuestion(q);
    if (!norm(sid)) return undefined;
    return structureFallbackData.find(row => row.type === "section" && (norm(row.item_id || row.id) === norm(sid) || norm(row.section_id || row.section) === norm(sid)));
  }

  function subtitleRowFor(q: AssessmentItem) {
    const ctx = q.acgs_subtitle_context;
    if (ctx) return { type: "subtitle", name_en: ctx.name_en ?? undefined, name_id: ctx.name_id ?? undefined } as AssessmentItem;
    return null;
  }

  function handlePageChange(action: "next" | "prev" | "first" | "last" | "jump") {
    if (typeof window === "undefined") return;
    
    // Tunggu render Svelte selesai baru scroll
    requestAnimationFrame(() => {
      if (action === "prev") {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    });
  }
</script>

<svelte:window onbeforeunload={saveScrollPosition} />

<div class="min-w-0 space-y-4">
  <section class="space-y-3">
    <h2 class="text-center text-lg font-bold text-slate-800">
      Tabel Skor Capaian Assessment ACGS PT PLN (Persero), Tahun Buku {selectedYear || currentYear}
    </h2>
    {#if isLoading}
      <div class="max-w-full min-w-0 overflow-x-auto rounded-lg border border-border bg-white shadow-sm animate-pulse">
        <div class="p-4 space-y-2">
          <Skeleton class="h-5 w-1/3 mx-auto" />
          {#each Array(4) as _}
            <div class="flex gap-2">
              <Skeleton class="h-4 flex-1" />
              <Skeleton class="h-4 w-16" />
              <Skeleton class="h-4 w-16" />
              <Skeleton class="h-4 w-16" />
              <Skeleton class="h-4 w-16" />
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <ScoreSummaryTable questions={allTableQuestions} />
    {/if}
  </section>

  <TableToolbar 
    bind:searchQuery={searchQuery}
    onSearch={handleFullSearch}
    onSearchInput={handleSearchInput}
    syncStatus={syncStatus}
    bind:selectedYear={selectedYear}
    availableYears={availableYears}
    canRecompute={canRecompute}
    assessmentQuestions={allTableQuestions}
  />

  <div class="w-full max-w-full min-w-0 overflow-hidden rounded-lg border border-border bg-white shadow-sm">
    <div class="w-full max-w-full overflow-x-auto">
    <table class="w-full min-w-175 border-collapse text-[11px] md:text-xs">
      <thead class="bg-primary text-white text-center font-bold sticky top-0 z-20">
        <tr>
          <th class="border border-border w-[8%] p-3 align-middle uppercase">ITEM</th>
          <th class="border border-border w-[42%] p-3 align-middle uppercase leading-tight">STANDAR TATA KELOLA<br />PERUSAHAAN</th>
          <th class="border border-border w-[15%] p-3 align-middle uppercase">IMPLEMENTASI</th>
          <th class="border border-border w-[15%] p-3 align-middle uppercase">EVIDENCE</th>
          <th class="border border-border w-[5%] p-3 align-middle uppercase leading-tight">STATUS<br />YES OR NO</th>
          <th class="border border-border w-[15%] p-3 align-middle uppercase">REKOMENDASI</th>
        </tr>
      </thead>
      <tbody class="align-top">
        {#if isLoading}
          {#each Array(8) as _}
            <tr class="animate-pulse">
              <td class="border border-border p-4 text-center align-middle"><Skeleton class="h-4 w-10 mx-auto" /></td>
              <td class="border border-border p-4">
                <Skeleton class="h-4 w-3/4 mb-2" />
                <Skeleton class="h-3 w-full mb-1" />
                <Skeleton class="h-3 w-2/3" />
              </td>
              <td class="border border-border p-3"><Skeleton class="h-20 w-full rounded-md" /></td>
              <td class="border border-border p-3"><Skeleton class="h-20 w-full rounded-md" /></td>
              <td class="border border-border p-3 align-middle"><Skeleton class="h-8 w-full rounded-md" /></td>
              <td class="border border-border p-3"><Skeleton class="h-20 w-full rounded-md" /></td>
            </tr>
          {/each}
        {:else if pagedQuestions.length > 0}
          {#each pagedQuestions as q, i}
            {@const headers = getHeadersForQuestion(q)}
            {@const prevHeaders = i > 0 ? getHeadersForQuestion(pagedQuestions[i - 1]) : { level: null, part: null }}
            
            {#if i === 0 || norm(headers.level?.label) !== norm(prevHeaders.level?.label)}
              <tr class="bg-[#e2e8f0]">
                <td class="border border-border p-2 font-bold text-slate-900 uppercase align-middle text-center">{norm(headers.level?.label) || "LEVEL"}</td>
                <td colspan="5" class="border border-border bg-[#e2e8f0]"></td>
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
                <td colspan="4" class="border border-border h-full bg-slate-50/20"></td>
              </tr>
            {/if}

            {@const sectionCanon = canonicalSectionIdForAcgsQuestion(q)}
            {@const prevSectionCanon = i > 0 ? canonicalSectionIdForAcgsQuestion(pagedQuestions[i - 1]) : ""}
            {#if norm(sectionCanon) && (i === 0 || norm(sectionCanon) !== norm(prevSectionCanon))}
              {@const section = findSectionRow(q)}
              {#if section}
                <tr class="bg-white">
                  <td class="border border-border p-2 font-bold text-slate-900 align-middle text-center bg-slate-50/30">{displayCode(section.item_id, section.id)}</td>
                  <td class="border border-border p-2 leading-tight align-top text-left">
                    <div class="text-slate-900 text-[11px] md:text-xs font-bold">{norm(section.name_en)}</div>
                    <div class="text-blue-700 text-[10px] md:text-[11px] mt-1 font-normal">{norm(section.name_id)}</div>
                  </td>
                  <td colspan="4" class="border border-border"></td>
                </tr>
              {/if}
            {/if}

            {@const subRow = subtitleRowFor(q)}
            {@const prevSubRow = i > 0 ? subtitleRowFor(pagedQuestions[i - 1]) : null}
            {#if subRow && (i === 0 || (subRow.name_en !== prevSubRow?.name_en))}
               <tr class="bg-primary/5">
                <td class="border border-border p-2 align-top bg-primary/5"></td>
                <td class="border border-border p-3 align-top leading-tight text-left">
                  {#if norm(subRow.name_en)}<div class="text-slate-900 text-[10px] font-bold mb-2">{norm(subRow.name_en)}</div>{/if}
                  {#if norm(subRow.name_id)}<div class="text-blue-700 text-[10px] font-bold leading-snug">{norm(subRow.name_id)}</div>{/if}
                </td>
                <td colspan="4" class="border border-border"></td>
              </tr>
            {/if}

            <tr class="hover:bg-slate-50 transition-colors">
              <td class="border border-border bg-white p-2 text-center align-middle">
                <ItemPreviewHoverCard
                  itemCode={displayCode(q.item_id, null)}
                  standardEn={norm(q.question_en)}
                  standardId={norm(q.question_id)}
                />
              </td>
              <td class="border border-border p-0 align-stretch">
                <div class="min-w-0 p-2 leading-tight text-left">
                  <div class="mb-1 text-justify text-[11px] font-medium text-slate-900 md:text-xs">{norm(q.question_en)}</div>
                  <div class="text-justify text-[10px] font-normal leading-snug text-blue-700 md:text-[11px]">{norm(q.question_id)}</div>
                </div>
              </td>
              <td class="border border-border p-0 align-top h-1">
                <EditableCell value={q.implementation} {q} field="implementation" placeholder="Implementasi — Ctrl+Enter atau ⌘+Enter untuk simpan" onSave={saveField} />
              </td>
              <td class="border border-border p-0 align-top h-1">
                <EvidenceCell 
                    {q} 
                    onSave={saveField} 
                    onUpload={handleFileUpload} 
                    onRemoveFile={handleRemoveFile}
                    stagedFile={stagedFiles[rowKeyOf(q) ?? ""] ?? null}
                    onFileSelected={(rq, f) => {
                        const validationError = validateEvidenceFile(f);
                        if (validationError) {
                          toast.error(validationError);
                          return;
                        }
                        const rk = rowKeyOf(rq);
                        if (rk) stagedFiles[rk] = f;
                    }}
                    onUnstageFile={(rq) => {
                        const rk = rowKeyOf(rq);
                        if (rk) {
                            const { [rk]: _, ...rest } = stagedFiles;
                            stagedFiles = rest;
                        }
                    }}
                />
              </td>
              <td class="border border-border p-0 align-middle text-center h-1">
                <StatusButtons {q} onSave={saveField} />
              </td>
              <td class="border border-border p-0 align-top h-1">
                <EditableCell
                  value={q.recommendation}
                  {q}
                  field="recommendation"
                  placeholder={recommendationDisabled(q) ? "Rekomendasi hanya untuk status NO" : "Rekomendasi — Ctrl+Enter atau ⌘+Enter untuk simpan"}
                  disabled={recommendationDisabled(q)}
                  onSave={saveField}
                />
              </td>
            </tr>
          {/each}
        {:else}
          <tr><td colspan="6" class="p-12 text-center text-muted-foreground border border-border italic">{debouncedFilterText.trim() ? `Tidak ada data untuk "${debouncedFilterText}".` : "Belum ada data."}</td></tr>
        {/if}
      </tbody>
    </table>
    </div>
  </div>

  <TablePagination 
    totalItems={filteredTableQuestions.length}
    bind:pageSize={pageSize}
    bind:currentPage={currentPage}
    debouncedFilterText={debouncedFilterText}
    allQuestionsCount={allTableQuestions.length}
    currentYear={currentYear}
    onPageChange={handlePageChange}
  />
</div>
