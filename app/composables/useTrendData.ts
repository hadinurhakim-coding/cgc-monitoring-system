import { useAcgsSummary, ACGS_SECTION_NAMES } from './useAcgsSummary'
import type { AcgsSectionData } from './useAcgsSummary'
import type { AoiBreakdown } from './useDashboardData'

export interface PartTrendPoint {
  year: number
  code: 'A' | 'B' | 'C' | 'D'
  name: string
  level1Score: number
  level1Max: number
  level2Score: number
  level2Max: number
  totalScore: number
  totalMax: number
  percentage: number
}

export interface YearRow {
  year: number
  level1Score: number
  level1Max: number
  level2Score: number
  level2Max: number
  totalScore: number
  totalMax: number
  percentage: number
  changeVsPrev: number | null
  aoiCount: number
  partA: number
  partB: number
  partC: number
  partD: number
}

export interface TrendInsight {
  avgScore: number
  bestImprovementPart: { code: string, name: string, change: number, fromYear: number, toYear: number } | null
  progressToTarget: number
  currentVsBenchmark: number
}

const BENCHMARK_SCORE = 85.71
const TARGET_SCORE = 90

const AOI_BY_YEAR: Record<number, number> = {
  2023: 28,
  2024: 20,
  2025: 12,
  2026: 10,
}

function getAllYearData(mockData: AcgsSectionData[]) {
  const years = [...new Set(mockData.map(d => d.year))].sort((a, b) => a - b)
  return years.map((year) => {
    const yearItems = mockData.filter(d => d.year === year)
    return { year, items: yearItems }
  })
}

export function useTrendData() {
  const acgs = useAcgsSummary()

  const allYearsRaw = computed(() => {
    const years = acgs.availableYears.value.map(y => y.value).sort((a, b) => a - b)
    return years.map((year) => {
      const saved = acgs.selectedYear.value
      acgs.selectedYear.value = year
      const s = { ...acgs.summary.value }
      const l1 = { ...acgs.level1Summary.value }
      const l2 = { ...acgs.level2Summary.value }
      const data = [...acgs.yearData.value]
      acgs.selectedYear.value = saved
      return { year, summary: s, level1: l1, level2: l2, data }
    })
  })

  const partTrendData = computed<PartTrendPoint[]>(() => {
    const codes: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D']
    const result: PartTrendPoint[] = []
    for (const yr of allYearsRaw.value) {
      for (const code of codes) {
        const l1 = yr.data.find(d => d.sectionCode === code && d.level === 1)
        const l2 = yr.data.find(d => d.sectionCode === code && d.level === 2)
        const l1Score = l1?.achievedScore ?? 0
        const l1Max = l1?.maxScore ?? 0
        const l2Score = l2?.achievedScore ?? 0
        const l2Max = l2?.maxScore ?? 0
        const total = l1Score + l2Score
        const max = l1Max + l2Max
        result.push({
          year: yr.year,
          code,
          name: ACGS_SECTION_NAMES[code],
          level1Score: l1Score,
          level1Max: l1Max,
          level2Score: l2Score,
          level2Max: l2Max,
          totalScore: total,
          totalMax: max,
          percentage: max > 0 ? Number(((total / max) * 100).toFixed(1)) : 0,
        })
      }
    }
    return result
  })

  const overallTrendData = computed(() =>
    allYearsRaw.value.map(yr => ({
      year: yr.year,
      totalScore: yr.summary.totalScore,
      totalMax: yr.summary.maxScore,
      percentage: yr.summary.percentage,
      level1Score: yr.summary.level1Score,
      level1Max: yr.summary.level1Max,
      level1Percentage: yr.summary.level1Percentage,
      level2Score: yr.summary.level2Score,
      level2Max: yr.summary.level2Max,
      level2Percentage: yr.summary.level2Percentage,
      target: TARGET_SCORE,
      benchmark: BENCHMARK_SCORE,
    })),
  )

  const tableRows = computed<YearRow[]>(() => {
    const rows: YearRow[] = []
    const sorted = [...allYearsRaw.value]
    for (let i = 0; i < sorted.length; i++) {
      const yr = sorted[i]
      const prev = i > 0 ? sorted[i - 1] : null
      const changeVsPrev = prev
        ? Number((yr.summary.percentage - prev.summary.percentage).toFixed(2))
        : null

      const partScore = (code: 'A' | 'B' | 'C' | 'D') => {
        const l1 = yr.data.find(d => d.sectionCode === code && d.level === 1)
        const l2 = yr.data.find(d => d.sectionCode === code && d.level === 2)
        return (l1?.achievedScore ?? 0) + (l2?.achievedScore ?? 0)
      }

      rows.push({
        year: yr.year,
        level1Score: yr.summary.level1Score,
        level1Max: yr.summary.level1Max,
        level2Score: yr.summary.level2Score,
        level2Max: yr.summary.level2Max,
        totalScore: yr.summary.totalScore,
        totalMax: yr.summary.maxScore,
        percentage: yr.summary.percentage,
        changeVsPrev,
        aoiCount: AOI_BY_YEAR[yr.year] ?? 0,
        partA: partScore('A'),
        partB: partScore('B'),
        partC: partScore('C'),
        partD: partScore('D'),
      })
    }
    return rows
  })

  const insights = computed<TrendInsight>(() => {
    const years = allYearsRaw.value
    const avgScore = years.length > 0
      ? Number((years.reduce((s, y) => s + y.summary.percentage, 0) / years.length).toFixed(2))
      : 0

    const codes: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D']
    let best: TrendInsight['bestImprovementPart'] = null
    let maxChange = -Infinity

    for (const code of codes) {
      const pts = partTrendData.value
        .filter(p => p.code === code)
        .sort((a, b) => a.year - b.year)

      for (let i = 1; i < pts.length; i++) {
        const change = pts[i].percentage - pts[i - 1].percentage
        if (change > maxChange) {
          maxChange = change
          best = {
            code,
            name: ACGS_SECTION_NAMES[code],
            change: Number(change.toFixed(1)),
            fromYear: pts[i - 1].year,
            toYear: pts[i].year,
          }
        }
      }
    }

    const latest = years[years.length - 1]
    const progressToTarget = latest
      ? Number(((latest.summary.percentage / TARGET_SCORE) * 100).toFixed(1))
      : 0

    const currentVsBenchmark = latest
      ? Number((latest.summary.percentage - BENCHMARK_SCORE).toFixed(2))
      : 0

    return { avgScore, bestImprovementPart: best, progressToTarget, currentVsBenchmark }
  })

  const years = computed(() => allYearsRaw.value.map(y => y.year))

  return {
    ...acgs,
    overallTrendData,
    partTrendData,
    tableRows,
    insights,
    years,
    targetScore: TARGET_SCORE,
    benchmarkScore: BENCHMARK_SCORE,
  }
}
