import type { Bracket, IrrfReducer, YearData } from './types'

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function calcProgressive(base: number, brackets: Bracket[]): number {
  if (base <= 0) return 0
  for (const bracket of brackets) {
    if (bracket.upTo === null || base <= bracket.upTo) {
      return round2(Math.max(0, base * bracket.rate - bracket.deduction))
    }
  }
  const last = brackets[brackets.length - 1]
  return round2(Math.max(0, base * last.rate - last.deduction))
}

export function calcEmployeeInss(salary: number, year: YearData): number {
  const capped = Math.min(salary, year.inss.ceiling)
  return calcProgressive(capped, year.inss.employeeBrackets)
}

export function calcIrrfReducer(gross: number, reducer: IrrfReducer | null): number {
  if (!reducer) return 0
  if (gross <= reducer.fullExemptionUpTo) return reducer.fixedReduction
  if (gross <= reducer.partialUpTo) {
    return Math.max(0, reducer.linearIntercept - reducer.linearSlope * gross)
  }
  return 0
}

export function calcIrrf(params: {
  taxableBase: number
  grossForReducer: number
  dependents: number
  year: YearData
  useSimplified?: boolean
}): number {
  const { taxableBase, grossForReducer, dependents, year, useSimplified = true } = params
  const legalDeductions = dependents * year.irrf.dependentDeduction
  const deduction = useSimplified
    ? Math.max(year.irrf.simplifiedDeduction, legalDeductions)
    : legalDeductions
  const base = Math.max(0, taxableBase - deduction)
  const raw = calcProgressive(base, year.irrf.brackets)
  const reduction = calcIrrfReducer(grossForReducer, year.irrf.reducer)
  return round2(Math.max(0, raw - reduction))
}

export function calcIndividualInss(base: number, year: YearData): number {
  const capped = Math.min(Math.max(0, base), year.inss.ceiling)
  return round2(capped * year.inss.individualRateOnPj)
}

export function monthsBetween(start: Date, end: Date): number {
  const years = end.getFullYear() - start.getFullYear()
  const months = end.getMonth() - start.getMonth()
  const days = end.getDate() - start.getDate()
  let total = years * 12 + months
  if (days >= 15) total += 1
  return Math.max(0, total)
}

export function yearsComplete(start: Date, end: Date): number {
  let years = end.getFullYear() - start.getFullYear()
  const anniversary = new Date(start)
  anniversary.setFullYear(start.getFullYear() + years)
  if (end < anniversary) years -= 1
  return Math.max(0, years)
}

export function parseIsoDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatBRL(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale === 'pt' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatPct(value: number, locale = 'en'): string {
  return new Intl.NumberFormat(locale === 'pt' ? 'pt-BR' : 'en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value)
}
