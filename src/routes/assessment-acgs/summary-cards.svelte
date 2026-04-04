<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import { 
    CheckCircle2, 
    FileText, 
    AlertTriangle, 
    TrendingUp, 
    Target,
    BarChart3
  } from "@lucide/svelte";

  // Data Props
  let { assessmentData = [], isLoading = false } = $props();

  // Dynamic Metrics Calculation
  const stats = $derived.by(() => {
    // filter for questions only
    const questions = assessmentData.filter(item => item.type === 'question');
    const total = questions.length;
    if (total === 0) return {
        progress: { total: 0, completed: 0, percentage: 0 },
        compliance: { score: 0, trend: "N/A", status: 'stable' },
        parts: [],
        evidence: { total: 0, fulfilled: 0, percentage: 0 },
        gaps: { total: 0, urgent: 0, normal: 0 }
    };

    const completed = questions.filter(q => q.implementation || q.status).length;
    const progressPerc = Math.round((completed / total) * 100);

    // Compliance (based on status YES/Y)
    const compliant = questions.filter(q => q.status === 'YES' || q.status === 'Y').length;
    const complianceScore = ((compliant / total) * 100).toFixed(1);

    // Parts breakdown (A, B, C, D, E)
    const partsList = [
        { id: 'A', color: 'var(--primary)' },
        { id: 'B', color: '#10b981' },
        { id: 'C', color: '#f59e0b' },
        { id: 'D', color: '#00b4d8' },
        { id: 'E', color: '#64748b' }
    ];
    
    const partsStats = partsList.map(p => {
        const partQuestions = questions.filter(q => (q.part_id || q.part) === `PART ${p.id}`);
        const pTotal = partQuestions.length;
        const pCompliant = partQuestions.filter(q => q.status === 'YES' || q.status === 'Y').length;
        const pScore = pTotal > 0 ? Math.round((pCompliant / pTotal) * 100) : 0;
        return { ...p, score: pScore };
    });

    const withEvidence = questions.filter(q => q.evidence).length;
    const evidencePerc = total > 0 ? Math.round((withEvidence / total) * 100) : 0;

    const totalGaps = questions.filter(q => q.status === 'NO' || q.status === 'N').length;
    const urgent = questions.filter(q => (q.status === 'NO' || q.status === 'N') && (q.level_label || q.level)?.includes('LEVEL 1')).length;

    return {
        progress: { total, completed, percentage: progressPerc },
        compliance: { score: complianceScore, trend: "+0%", status: 'stable' },
        parts: partsStats,
        evidence: { total, fulfilled: withEvidence, percentage: evidencePerc },
        gaps: { total: totalGaps, urgent: urgent, normal: totalGaps - urgent }
    };
  });
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
  <!-- Card 1: Overall Progress -->
  <Card.Root class="overflow-hidden border-blue-100 shadow-sm hover:shadow-md transition-shadow">
    <Card.Content class="p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</span>
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
            <span class="text-[10px] text-muted-foreground mb-1">({stats.progress.completed}/{stats.progress.total})</span>
        </div>
        <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
            class="bg-primary h-full rounded-full transition-all duration-1000" 
            style="width: {stats.progress.percentage}%"
            ></div>
        </div>
        <p class="text-[10px] text-muted-foreground mt-2 italic font-medium">Asesmen sedang berjalan</p>
      {/if}
    </Card.Content>
  </Card.Root>

  <!-- Card 2: Compliance Score -->
  <Card.Root class="overflow-hidden border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
    <Card.Content class="p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Compliance</span>
        <div class="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
          <Target size={16} />
        </div>
      </div>
      {#if isLoading}
        <div class="space-y-2 mt-1">
          <Skeleton class="h-8 w-16" />
          <Skeleton class="h-1 w-full" />
        </div>
      {:else}
        <div class="flex items-end gap-2 mb-1">
            <span class="text-2xl font-bold text-emerald-700">{stats.compliance.score}</span>
            <div class="flex items-center text-[10px] text-emerald-600 mb-1 font-bold">
            <TrendingUp size={10} class="mr-0.5" />
            {stats.compliance.trend}
            </div>
        </div>
        <p class="text-[10px] text-muted-foreground">Tingkat kepatuhan GCG</p>
        <div class="flex gap-0.5 mt-3">
            {#each [1,2,3,4,5,6,7,8,9,10] as i}
            <div class="h-1 flex-1 rounded-full {i <= (Number(stats.compliance.score) / 10) ? 'bg-emerald-500' : 'bg-slate-100'}"></div>
            {/each}
        </div>
      {/if}
    </Card.Content>
  </Card.Root>

  <!-- Card 3: Part-wise Breakdown -->
  <Card.Root class="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <Card.Content class="p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Scores by Part</span>
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
                <span class="text-[9px] font-bold w-3 text-slate-500">{part.id}</span>
                <div class="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                <div 
                    class="h-full rounded-full transition-all duration-1000" 
                    style="width: {part.score}%; background-color: {part.color}"
                ></div>
                </div>
                <span class="text-[9px] font-medium w-6 text-right text-slate-700">{part.score}</span>
            </div>
            {/each}
        {/if}
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Card 4: Evidence Status -->
  <Card.Root class="overflow-hidden border-purple-100 shadow-sm hover:shadow-md transition-shadow">
    <Card.Content class="p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Evidence</span>
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
        <div class="flex items-end gap-2 mb-1">
            <span class="text-2xl font-bold text-accent">{stats.evidence.percentage}%</span>
            <span class="text-[10px] text-muted-foreground mb-1">Fulfilled</span>
        </div>
        <p class="text-[10px] text-muted-foreground mb-3 font-medium">
            {stats.evidence.fulfilled} items documented
        </p>
        <div class="relative pt-1 overflow-hidden">
            <div class="flex h-1 overflow-hidden rounded bg-slate-100">
            <div style="width: {stats.evidence.percentage}%" class="bg-accent transition-all duration-1000"></div>
            </div>
        </div>
      {/if}
    </Card.Content>
  </Card.Root>

  <!-- Card 5: Gaps & Recs -->
  <Card.Root class="overflow-hidden border-orange-100 shadow-sm hover:shadow-md transition-shadow bg-linear-to-br from-white to-orange-50/30">
    <Card.Content class="p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gaps Found</span>
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
                <span class="text-[10px] font-bold text-red-600 uppercase">{stats.gaps.urgent} Critical</span>
            </div>
            <div class="flex items-center gap-1">
                <div class="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                <span class="text-[10px] font-medium text-orange-600 uppercase">{stats.gaps.normal} General</span>
            </div>
            </div>
        </div>
        <p class="text-[10px] text-muted-foreground mt-2 border-t border-orange-100 pt-2 font-medium italic">Gaps needing action</p>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
