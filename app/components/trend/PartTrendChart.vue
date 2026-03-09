<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { PartTrendPoint } from '~/composables/useTrendData'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps<{
  data: PartTrendPoint[]
  years: number[]
  mode: 'total' | 'level1' | 'level2'
}>()

const PART_STYLES: Record<string, { color: string, dash?: number[] }> = {
  A: { color: '#125d72' },
  B: { color: '#14a2ba' },
  C: { color: '#0e4a5b' },
  D: { color: '#f59e0b' },
}

function getValue(pt: PartTrendPoint): number {
  if (props.mode === 'level1') return pt.level1Max > 0 ? Number(((pt.level1Score / pt.level1Max) * 100).toFixed(1)) : 0
  if (props.mode === 'level2') return pt.level2Max > 0 ? Number(((pt.level2Score / pt.level2Max) * 100).toFixed(1)) : 0
  return pt.percentage
}

const chartData = computed(() => {
  const codes: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D']
  const PART_LABELS: Record<string, string> = {
    A: 'Part A — Hak Pemegang Saham',
    B: 'Part B — Keberlanjutan',
    C: 'Part C — Transparansi',
    D: 'Part D — Tanggung Jawab Dewan',
  }
  return {
    labels: props.years.map(y => y.toString()),
    datasets: codes.map(code => ({
      label: PART_LABELS[code],
      data: props.years.map((year) => {
        const pt = props.data.find(d => d.code === code && d.year === year)
        return pt ? getValue(pt) : 0
      }),
      borderColor: PART_STYLES[code].color,
      backgroundColor: 'transparent',
      borderDash: PART_STYLES[code].dash,
      tension: 0.35,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointBackgroundColor: PART_STYLES[code].color,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      borderWidth: 2.5,
    })),
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { usePointStyle: true, padding: 16, font: { size: 11 } },
    },
    tooltip: {
      backgroundColor: '#09303b',
      titleFont: { size: 13 },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx: any) => {
          const year = props.years[ctx.dataIndex]
          const code = (['A', 'B', 'C', 'D'] as const)[ctx.datasetIndex]
          const pt = props.data.find(d => d.code === code && d.year === year)
          if (!pt) return `${ctx.dataset.label}: ${ctx.parsed.y}%`
          if (props.mode === 'total') return `Part ${code}: ${pt.percentage}% (${pt.totalScore}/${pt.totalMax})`
          if (props.mode === 'level1') return `Part ${code} L1: ${pt.level1Score}/${pt.level1Max}`
          return `Part ${code} L2: ${pt.level2Score}/${pt.level2Max}`
        },
      },
    },
  },
  scales: {
    y: {
      min: 50,
      max: 100,
      ticks: { callback: (v: any) => `${v}%`, font: { size: 11 }, stepSize: 10 },
      grid: { color: 'rgba(0,0,0,0.06)' },
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 13, weight: 600 as any } },
    },
  },
}
</script>
