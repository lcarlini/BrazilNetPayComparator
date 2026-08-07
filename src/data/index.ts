import type { YearData } from '../calc/types'
import data2024 from './years/2024.json'
import data2025 from './years/2025.json'
import data2026 from './years/2026.json'

const YEARS: Record<number, YearData> = {
  2024: data2024 as YearData,
  2025: data2025 as YearData,
  2026: data2026 as YearData,
}

export const AVAILABLE_YEARS = Object.keys(YEARS)
  .map(Number)
  .sort((a, b) => b - a)

export const DEFAULT_YEAR = AVAILABLE_YEARS[0] ?? 2026

export function getYearData(year: number): YearData {
  const data = YEARS[year]
  if (!data) {
    throw new Error(`No tax tables for year ${year}. Add src/data/years/${year}.json`)
  }
  return data
}

export function listYearSources(year: number) {
  return getYearData(year).sources
}
