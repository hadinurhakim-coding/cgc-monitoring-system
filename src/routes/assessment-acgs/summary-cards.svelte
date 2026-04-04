<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { 
    CheckCircle2, 
    FileText, 
    AlertTriangle, 
    TrendingUp, 
    Target,
    BarChart3
  } from "@lucide/svelte";

  // Mockup Data
  const summaryData = {
    progress: { total: 128, completed: 86, percentage: 67 },
    compliance: { score: 84.5, trend: "+2.4%", status: 'improving' },
    parts: [
        { id: 'A', name: 'Part A', score: 92, color: 'var(--primary)' },
        { id: 'B', name: 'Part B', score: 75, color: '#10b981' },
        { id: 'C', name: 'Part C', score: 62, color: '#f59e0b' },
        { id: 'D', name: 'Part D', score: 88, color: '#00b4d8' },
        { id: 'E', name: 'Part E', score: 70, color: '#64748b' }
    ],
    evidence: { total: 128, fulfilled: 48, percentage: 37.5 },
    gaps: { total: 12, urgent: 4, normal: 8 }
  };
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
      <div class="flex items-end gap-2 mb-1">
        <span class="text-2xl font-bold">{summaryData.progress.percentage}%</span>
        <span class="text-[10px] text-muted-foreground mb-1">({summaryData.progress.completed}/{summaryData.progress.total})</span>
      </div>
      <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div 
          class="bg-primary h-full rounded-full transition-all duration-1000" 
          style="width: {summaryData.progress.percentage}%"
        ></div>
      </div>
      <p class="text-[10px] text-muted-foreground mt-2 italic font-medium">Asesmen sedang berjalan</p>
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
      <div class="flex items-end gap-2 mb-1">
        <span class="text-2xl font-bold text-emerald-700">{summaryData.compliance.score}</span>
        <div class="flex items-center text-[10px] text-emerald-600 mb-1 font-bold">
          <TrendingUp size={10} class="mr-0.5" />
          {summaryData.compliance.trend}
        </div>
      </div>
      <p class="text-[10px] text-muted-foreground">Tingkat kepatuhan GCG rata-rata</p>
      
      <div class="flex gap-0.5 mt-3">
        {#each [1,2,3,4,5,6,7,8,9,10] as i}
          <div class="h-1 flex-1 rounded-full {i <= 8 ? 'bg-emerald-500' : 'bg-slate-100'}"></div>
        {/each}
      </div>
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
        {#each summaryData.parts as part}
          <div class="flex items-center gap-2">
            <span class="text-[9px] font-bold w-8 text-slate-500">{part.id}</span>
            <div class="flex-1 bg-slate-100 h-1 rounded-full">
              <div 
                class="h-full rounded-full transition-all duration-1000" 
                style="width: {part.score}%; background-color: {part.color}"
              ></div>
            </div>
            <span class="text-[9px] font-medium w-6 text-right text-slate-700">{part.score}</span>
          </div>
        {/each}
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
      <div class="flex items-end gap-2 mb-1">
        <span class="text-2xl font-bold text-accent">{summaryData.evidence.percentage}%</span>
        <span class="text-[10px] text-muted-foreground mb-1">Fulfilled</span>
      </div>
      <p class="text-[10px] text-muted-foreground mb-3 font-medium text-center">
        {summaryData.evidence.fulfilled} documents uploaded
      </p>
      
      <div class="relative pt-1">
        <div class="flex h-1 overflow-hidden rounded bg-slate-100 text-xs">
          <div style="width: 37.5%" class="bg-accent"></div>
        </div>
      </div>
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
      <div class="flex items-center gap-3">
        <div class="text-3xl font-bold text-orange-700">{summaryData.gaps.total}</div>
        <div class="flex flex-col">
          <div class="flex items-center gap-1">
            <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            <span class="text-[10px] font-bold text-red-600 uppercase">{summaryData.gaps.urgent} Critical</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
            <span class="text-[10px] font-medium text-orange-600 uppercase">{summaryData.gaps.normal} General</span>
          </div>
        </div>
      </div>
      <p class="text-[10px] text-muted-foreground mt-2 border-t border-orange-100 pt-2 font-medium italic">Requirement gaps needing action</p>
    </Card.Content>
  </Card.Root>
</div>
