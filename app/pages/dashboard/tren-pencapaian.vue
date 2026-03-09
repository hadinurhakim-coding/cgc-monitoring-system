<template>
  <div>
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gcg-dark dark:text-white">
          Tren Pencapaian ACGS
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Analisis tren historis dan proyeksi pencapaian skor ACGS per tahun
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-calendar-range" class="size-4 text-gray-400" />
          <span class="text-sm text-gray-500">{{ years[0] }} — {{ years[years.length - 1] }}</span>
        </div>
      </div>
    </div>

    <!-- Row 1: Insight Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <!-- Rata-rata Skor Historis -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div class="flex items-center justify-between mb-3">
          <div class="size-10 rounded-lg flex items-center justify-center bg-gcg-light dark:bg-gcg-primary/20">
            <UIcon name="i-lucide-calculator" class="size-5 text-gcg-primary dark:text-gcg-accent" />
          </div>
        </div>
        <p class="text-3xl font-bold text-gcg-dark dark:text-white">{{ insights.avgScore }}%</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Rata-rata Skor Historis</p>
        <p class="text-xs text-gray-400 mt-2">Dari {{ years.length }} tahun asesmen</p>
      </div>

      <!-- Peningkatan Tertinggi -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div class="flex items-center justify-between mb-3">
          <div class="size-10 rounded-lg flex items-center justify-center bg-green-50 dark:bg-green-900/20">
            <UIcon name="i-lucide-trending-up" class="size-5 text-green-600 dark:text-green-400" />
          </div>
          <span
            v-if="insights.bestImprovementPart"
            class="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          >
            +{{ insights.bestImprovementPart.change }}%
          </span>
        </div>
        <p class="text-3xl font-bold text-green-600 dark:text-green-400">
          Part {{ insights.bestImprovementPart?.code || '-' }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Peningkatan Tertinggi</p>
        <p v-if="insights.bestImprovementPart" class="text-xs text-gray-400 mt-2">
          {{ insights.bestImprovementPart.fromYear }} → {{ insights.bestImprovementPart.toYear }}
        </p>
      </div>

      <!-- Progress ke Target -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div class="flex items-center justify-between mb-3">
          <div class="size-10 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
            <UIcon name="i-lucide-target" class="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span class="text-xs font-medium text-gray-400">Target {{ targetScore }}%</span>
        </div>
        <p class="text-3xl font-bold text-gcg-dark dark:text-white">{{ insights.progressToTarget }}%</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Progress ke Target</p>
        <div class="mt-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all duration-500"
            :class="insights.progressToTarget >= 100 ? 'bg-green-500' : 'bg-blue-500'"
            :style="{ width: `${Math.min(insights.progressToTarget, 100)}%` }"
          />
        </div>
      </div>

      <!-- vs Benchmark PLN -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div class="flex items-center justify-between mb-3">
          <div class="size-10 rounded-lg flex items-center justify-center bg-purple-50 dark:bg-purple-900/20">
            <UIcon name="i-lucide-git-compare-arrows" class="size-5 text-purple-600 dark:text-purple-400" />
          </div>
          <span
            class="text-xs font-semibold px-2 py-0.5 rounded-full"
            :class="insights.currentVsBenchmark >= 0
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
          >
            {{ insights.currentVsBenchmark >= 0 ? '+' : '' }}{{ insights.currentVsBenchmark }}%
          </span>
        </div>
        <p class="text-3xl font-bold text-gcg-dark dark:text-white">{{ benchmarkScore }}%</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Benchmark PLN 2024</p>
        <p class="text-xs text-gray-400 mt-2">
          {{ insights.currentVsBenchmark >= 0 ? 'Di atas' : 'Di bawah' }} benchmark
        </p>
      </div>
    </div>

    <!-- Row 2: Main Trend Chart -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 class="font-semibold text-gcg-dark dark:text-white">Tren Skor ACGS Keseluruhan</h3>
          <p class="text-xs text-gray-400 mt-0.5">
            Perkembangan skor total, Level 1, Level 2 dengan garis target & benchmark
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span class="flex items-center gap-1.5">
            <span class="size-3 rounded-full bg-red-500 opacity-60" />
            Target {{ targetScore }}%
          </span>
          <span class="flex items-center gap-1.5">
            <span class="size-3 rounded-full bg-purple-500 opacity-60" />
            Benchmark {{ benchmarkScore }}%
          </span>
        </div>
      </div>
      <div class="h-80 sm:h-96">
        <ClientOnly>
          <TrendOverallTrendChart :data="overallTrendData" />
          <template #fallback>
            <div class="h-full flex items-center justify-center text-gray-400">
              <UIcon name="i-lucide-loader-2" class="size-6 animate-spin" />
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- Row 3: Part Trend Chart with Mode Toggle -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 class="font-semibold text-gcg-dark dark:text-white">Tren per Bagian (Part A–D)</h3>
          <p class="text-xs text-gray-400 mt-0.5">Perbandingan pencapaian antar bagian dari tahun ke tahun</p>
        </div>
        <div class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
          <button
            v-for="m in partModes"
            :key="m.value"
            class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
            :class="partMode === m.value
              ? 'bg-white dark:bg-gray-700 text-gcg-dark dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
            @click="partMode = m.value"
          >
            {{ m.label }}
          </button>
        </div>
      </div>
      <div class="h-72 sm:h-80">
        <ClientOnly>
          <TrendPartTrendChart :data="partTrendData" :years="years" :mode="partMode" />
          <template #fallback>
            <div class="h-full flex items-center justify-center text-gray-400">
              <UIcon name="i-lucide-loader-2" class="size-6 animate-spin" />
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- Row 4: Summary Table -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-semibold text-gcg-dark dark:text-white">Tabel Ringkasan Tren</h3>
          <p class="text-xs text-gray-400 mt-0.5">Detail numerik skor per tahun dengan persentase perubahan</p>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left py-3 px-2 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Tahun</th>
              <th class="text-center py-3 px-2 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Part A</th>
              <th class="text-center py-3 px-2 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Part B</th>
              <th class="text-center py-3 px-2 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Part C</th>
              <th class="text-center py-3 px-2 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Part D</th>
              <th class="text-center py-3 px-2 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Level 1</th>
              <th class="text-center py-3 px-2 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Level 2</th>
              <th class="text-center py-3 px-2 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Total</th>
              <th class="text-center py-3 px-2 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">%</th>
              <th class="text-center py-3 px-2 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Δ</th>
              <th class="text-center py-3 px-2 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">AoI</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in tableRows"
              :key="row.year"
              class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td class="py-3 px-2 font-semibold text-gcg-dark dark:text-white">{{ row.year }}</td>
              <td class="text-center py-3 px-2 text-gray-600 dark:text-gray-300">{{ row.partA }}</td>
              <td class="text-center py-3 px-2 text-gray-600 dark:text-gray-300">{{ row.partB }}</td>
              <td class="text-center py-3 px-2 text-gray-600 dark:text-gray-300">{{ row.partC }}</td>
              <td class="text-center py-3 px-2 text-gray-600 dark:text-gray-300">{{ row.partD }}</td>
              <td class="text-center py-3 px-2 text-gray-600 dark:text-gray-300">
                {{ row.level1Score }}/{{ row.level1Max }}
              </td>
              <td class="text-center py-3 px-2 text-gray-600 dark:text-gray-300">
                {{ row.level2Score }}/{{ row.level2Max }}
              </td>
              <td class="text-center py-3 px-2 font-semibold text-gcg-dark dark:text-white">
                {{ row.totalScore }}/{{ row.totalMax }}
              </td>
              <td class="text-center py-3 px-2">
                <span
                  class="font-bold"
                  :class="row.percentage >= 90 ? 'text-green-600' : row.percentage >= 70 ? 'text-amber-600' : 'text-red-600'"
                >
                  {{ row.percentage }}%
                </span>
              </td>
              <td class="text-center py-3 px-2">
                <span v-if="row.changeVsPrev !== null" class="text-xs font-semibold" :class="row.changeVsPrev >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ row.changeVsPrev >= 0 ? '+' : '' }}{{ row.changeVsPrev }}%
                </span>
                <span v-else class="text-gray-300 dark:text-gray-600">—</span>
              </td>
              <td class="text-center py-3 px-2">
                <span class="inline-flex items-center justify-center size-6 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  {{ row.aoiCount }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Row 5: Part Score Breakdown per Year -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div class="mb-4">
        <h3 class="font-semibold text-gcg-dark dark:text-white">Detail Pencapaian per Bagian & Tahun</h3>
        <p class="text-xs text-gray-400 mt-0.5">Skor Level 1 dan Level 2 per Part untuk setiap tahun asesmen</p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          v-for="year in years"
          :key="year"
          class="rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          <div class="bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 flex items-center justify-between">
            <span class="text-sm font-semibold text-gcg-dark dark:text-white">{{ year }}</span>
            <span
              class="text-xs font-semibold px-2 py-0.5 rounded-full"
              :class="getYearPercentage(year) >= 90
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : getYearPercentage(year) >= 70
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
            >
              {{ getYearPercentage(year) }}%
            </span>
          </div>
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-800">
                <th class="text-left py-2 px-4 font-medium text-gray-400">Part</th>
                <th class="text-right py-2 px-3 font-medium text-gray-400">L1</th>
                <th class="text-right py-2 px-3 font-medium text-gray-400">L2</th>
                <th class="text-right py-2 px-3 font-medium text-gray-400">Total</th>
                <th class="text-right py-2 px-4 font-medium text-gray-400">%</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="part in getPartsForYear(year)"
                :key="part.code"
                class="border-b border-gray-50 dark:border-gray-800/30"
              >
                <td class="py-2 px-4 text-gcg-dark dark:text-gray-200 font-medium">Part {{ part.code }}</td>
                <td class="text-right py-2 px-3 text-gray-500">{{ part.level1Score }}/{{ part.level1Max }}</td>
                <td class="text-right py-2 px-3 text-gray-500">{{ part.level2Score }}/{{ part.level2Max }}</td>
                <td class="text-right py-2 px-3 font-medium text-gcg-dark dark:text-white">{{ part.totalScore }}/{{ part.totalMax }}</td>
                <td class="text-right py-2 px-4">
                  <span class="font-semibold" :class="part.percentage >= 90 ? 'text-green-600' : part.percentage >= 70 ? 'text-amber-600' : 'text-red-600'">
                    {{ part.percentage }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  title: 'Tren Pencapaian',
})

useHead({
  title: 'Tren Pencapaian — GCG Monitoring System',
})

const {
  overallTrendData,
  partTrendData,
  tableRows,
  insights,
  years,
  targetScore,
  benchmarkScore,
} = useTrendData()

const partMode = ref<'total' | 'level1' | 'level2'>('total')
const partModes = [
  { value: 'total' as const, label: 'Total' },
  { value: 'level1' as const, label: 'Level 1' },
  { value: 'level2' as const, label: 'Level 2' },
]

function getPartsForYear(year: number) {
  return partTrendData.value.filter(p => p.year === year)
}

function getYearPercentage(year: number): number {
  const row = tableRows.value.find(r => r.year === year)
  return row?.percentage ?? 0
}
</script>
