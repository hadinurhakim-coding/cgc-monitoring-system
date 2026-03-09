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
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface DataPoint {
  year: number
  percentage: number
  level1Percentage: number
  level2Percentage: number
  target: number
  benchmark: number
  totalScore: number
  totalMax: number
  level1Score: number
  level2Score: number
}

const props = defineProps<{ data: DataPoint[] }>()

const chartData = computed(() => ({
  labels: props.data.map(d => d.year.toString()),
  datasets: [
    {
      label: 'Skor Total (%)',
      data: props.data.map(d => d.percentage),
      borderColor: '#125d72',
      backgroundColor: 'rgba(18, 93, 114, 0.1)',
      fill: true,
      tension: 0.35,
      pointRadius: 6,
      pointHoverRadius: 9,
      pointBackgroundColor: '#125d72',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      borderWidth: 3,
      order: 1,
    },
    {
      label: 'Level 1 (%)',
      data: props.data.map(d => d.level1Percentage),
      borderColor: '#14a2ba',
      backgroundColor: 'transparent',
      borderDash: [6, 3],
      tension: 0.35,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: '#14a2ba',
      borderWidth: 2,
      order: 2,
    },
    {
      label: 'Level 2 (%)',
      data: props.data.map(d => d.level2Percentage),
      borderColor: '#efe62f',
      backgroundColor: 'transparent',
      borderDash: [4, 4],
      tension: 0.35,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: '#efe62f',
      borderWidth: 2,
      order: 3,
    },
    {
      label: 'Target (90%)',
      data: props.data.map(d => d.target),
      borderColor: '#ef4444',
      backgroundColor: 'transparent',
      borderDash: [10, 5],
      pointRadius: 0,
      borderWidth: 1.5,
      order: 4,
    },
    {
      label: 'Benchmark PLN (85.71%)',
      data: props.data.map(d => d.benchmark),
      borderColor: '#8b5cf6',
      backgroundColor: 'transparent',
      borderDash: [3, 6],
      pointRadius: 0,
      borderWidth: 1.5,
      order: 5,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { usePointStyle: true, padding: 20, font: { size: 12 } },
    },
    tooltip: {
      backgroundColor: '#09303b',
      titleFont: { size: 13, weight: 'bold' as const },
      bodyFont: { size: 12 },
      padding: 14,
      cornerRadius: 8,
      callbacks: {
        label: (ctx: any) => {
          const pt = props.data[ctx.dataIndex]
          if (!pt) return `${ctx.dataset.label}: ${ctx.parsed.y}%`
          if (ctx.datasetIndex === 0) {
            return [
              `Skor Total: ${pt.percentage}% (${pt.totalScore}/${pt.totalMax})`,
              `  Level 1: ${pt.level1Score} poin`,
              `  Level 2: ${pt.level2Score} poin`,
            ]
          }
          return `${ctx.dataset.label}: ${ctx.parsed.y}%`
        },
      },
    },
  },
  scales: {
    y: {
      min: 55,
      max: 100,
      ticks: { callback: (v: any) => `${v}%`, font: { size: 11 }, stepSize: 5 },
      grid: { color: 'rgba(0,0,0,0.06)' },
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 13, weight: 600 as any } },
    },
  },
}
</script>
