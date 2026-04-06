<script lang="ts">
  import { isAcgsQuestionRow } from "../acgs-defaults.js";
  import type { AssessmentSummaryMetrics } from "../acgs-summary-types.js";
  import {
    computeAssessmentSummaryMetrics,
    emptyAssessmentSummaryMetrics
  } from "../assessment-metrics.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import {
    CheckCircle2,
    FileText,
    AlertTriangle,
    Target,
    BarChart3
  } from "@lucide/svelte";

  let {
    assessmentData = [],
    summaryMetrics = null as AssessmentSummaryMetrics | null,
    isLoading = false
  } = $props();

  /** Satu sumber angka: server `summaryMetrics`, atau fallback hitung sama dari `assessmentData`. */
  const stats = $derived.by(() => {
    if (summaryMetrics) return summaryMetrics;
    const questions = assessmentData.filter((item) => isAcgsQuestionRow(item));
    if (questions.length === 0) return emptyAssessmentSummaryMetrics();
    return computeAssessmentSummaryMetrics(questions);
  });
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
  <!-- Card 1: Skor keseluruhan -->
  <Card.Root class="overflow-hidden border-blue-100 shadow-sm hover:shadow-md transition-shadow">
    <Card.Content class="p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Skor GCG</span>
        <div class="p-1.5 bg-blue-50 text-blue-600 rounded-md">
          <CheckCircle2 size={16} />
        </div>
      </div>
      {#if isLoading}
        <div class="space-y-2 mt-1">
          <Skeleton class="h-8 w-20" />
          <Skeleton class="h-1.5 w-full" />
        </div>
      {:else}
        <div class="flex items-end gap-2 mb-1">
          <span class="text-2xl font-bold">{stats.progress.percentage}%</span>
          <span class="text-[10px] text-muted-foreground mb-1"
            >({stats.progress.pointsSum}/{stats.progress.total})</span
          >
        </div>
        <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            class="bg-primary h-full rounded-full transition-all duration-1000"
            style="width: {stats.progress.percentage}%"
          ></div>
        </div>
        <p class="text-[10px] text-muted-foreground mt-2 leading-snug">
          Poin = N/A atau (YES + bukti). Rata-rata pada semua pertanyaan tahun ini.
        </p>
      {/if}
    </Card.Content>
  </Card.Root>

  <!-- Card 2: Grafik skor per Part (tahun dipilih) -->
  <Card.Root class="overflow-hidden border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
    <Card.Content class="p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
          >Skor per Part</span
        >
        <div class="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
          <Target size={16} />
        </div>
      </div>
      {#if isLoading}
        <div class="space-y-2 mt-1">
          {#each Array(4) as _}
            <Skeleton class="h-2 w-full" />
          {/each}
        </div>
      {:else}
        <div class="max-h-[140px] overflow-y-auto space-y-2 pr-1">
          {#if stats.parts.length === 0}
            <p class="text-[10px] text-muted-foreground italic">Belum ada data part.</p>
          {:else}
            {#each stats.parts as part}
              <div class="flex flex-col gap-0.5">
                <div class="flex justify-between text-[9px] text-slate-600">
                  <span class="font-medium truncate pr-1" title={part.label}>{part.label}</span>
                  <span class="shrink-0 font-bold text-emerald-700">{part.score}%</span>
                </div>
                <div class="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    style="width: {part.score}%; background-color: {part.color}"
                  ></div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
        <p class="text-[10px] text-muted-foreground mt-2">Tahun assessment yang sedang dibuka.</p>
      {/if}
    </Card.Content>
  </Card.Root>

  <!-- Card 3: Rincian bar (sama data Part) -->
  <Card.Root class="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <Card.Content class="p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
          >Rincian Part</span
        >
        <div class="p-1.5 bg-slate-100 text-slate-600 rounded-md">
          <BarChart3 size={16} />
        </div>
      </div>
      <div class="space-y-1.5 mt-2">
        {#if isLoading}
          {#each Array(5) as _}
            <Skeleton class="h-1 w-full" />
          {/each}
        {:else}
          {#each stats.parts as part}
            <div class="flex items-center gap-2">
              <span class="text-[9px] font-bold w-6 text-slate-500 shrink-0">{part.id}</span>
              <div class="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-1000"
                  style="width: {part.score}%; background-color: {part.color}"
                ></div>
              </div>
              <span class="text-[9px] font-medium w-7 text-right text-slate-700">{part.score}</span>
            </div>
          {/each}
        {/if}
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Card 4: Komposisi poin (ringkas) -->
  <Card.Root class="overflow-hidden border-purple-100 shadow-sm hover:shadow-md transition-shadow">
    <Card.Content class="p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Komposisi</span>
        <div class="p-1.5 bg-accent/10 text-accent rounded-md">
          <FileText size={16} />
        </div>
      </div>
      {#if isLoading}
        <div class="space-y-2">
          <Skeleton class="h-8 w-24" />
          <Skeleton class="h-1 w-full" />
        </div>
      {:else}
        <ul class="text-[10px] text-muted-foreground space-y-1.5 mt-1">
          <li>
            <span class="font-semibold text-foreground">{stats.evidence.naCount}</span> N/A (poin 1)
          </li>
          <li>
            <span class="font-semibold text-foreground">{stats.evidence.yesWithEvidenceCount}</span>
            YES + bukti (poin 1)
          </li>
          <li>
            <span class="font-semibold text-foreground">{stats.evidence.zeroPointCount}</span> belum poin
            1
          </li>
        </ul>
      {/if}
    </Card.Content>
  </Card.Root>

  <!-- Card 5: Gap = status NO -->
  <Card.Root
    class="overflow-hidden border-orange-100 shadow-sm hover:shadow-md transition-shadow bg-linear-to-br from-white to-orange-50/30"
  >
    <Card.Content class="p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gap (NO)</span>
        <div class="p-1.5 bg-orange-50 text-orange-600 rounded-md">
          <AlertTriangle size={16} />
        </div>
      </div>
      {#if isLoading}
        <div class="flex items-center gap-2">
          <Skeleton class="h-10 w-10 rounded" />
          <div class="space-y-1">
            <Skeleton class="h-3 w-16" />
            <Skeleton class="h-3 w-16" />
          </div>
        </div>
      {:else}
        <div class="flex items-center gap-3">
          <div class="text-3xl font-bold text-orange-700">{stats.gaps.total}</div>
          <div class="flex flex-col">
            <div class="flex items-center gap-1">
              <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span class="text-[10px] font-bold text-red-600 uppercase">{stats.gaps.urgent} Critical</span
              >
            </div>
            <div class="flex items-center gap-1">
              <div class="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
              <span class="text-[10px] font-medium text-orange-600 uppercase"
                >{stats.gaps.normal} General</span
              >
            </div>
          </div>
        </div>
        <p class="text-[10px] text-muted-foreground mt-2 border-t border-orange-100 pt-2 font-medium italic">
          Hanya baris ber-status NO; critical = Level 1.
        </p>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
