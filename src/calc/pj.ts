import { breakDownCostItems, sumCostItemsMonthly, type CostItem } from '../data/costCatalog'
import { calcIndividualInss, calcIrrf, round2 } from './math'
import type {
  AnnexMode,
  PjRegime,
  PjResult,
  SimplesBracket,
  TaxShareKey,
  YearData,
} from './types'

function pickBracket(rbt12: number, brackets: SimplesBracket[]): SimplesBracket {
  return brackets.find((b) => rbt12 <= b.upTo) ?? brackets[brackets.length - 1]
}

function effectiveSimplesRate(rbt12: number, bracket: SimplesBracket): number {
  if (rbt12 <= 0) return bracket.nominalRate
  return (rbt12 * bracket.nominalRate - bracket.deduction) / rbt12
}

function resolveAnnex(
  mode: AnnexMode,
  fatorR: number,
  threshold: number,
): 'III' | 'V' {
  if (mode === 'III') return 'III'
  if (mode === 'V') return 'V'
  return fatorR >= threshold ? 'III' : 'V'
}

function simplesTax(
  revenue: number,
  rbt12: number,
  annex: 'III' | 'V',
  year: YearData,
  exportMode: boolean,
): { tax: number; rate: number; breakdown: Record<string, number>; bracket: SimplesBracket } {
  const table = annex === 'III' ? year.pj.simples.annexIII : year.pj.simples.annexV
  const bracket = pickBracket(rbt12 || revenue * 12, table)
  const baseRate = effectiveSimplesRate(rbt12 || revenue * 12, bracket)

  let payableShare = 1
  const breakdown: Record<string, number> = {}
  const exempt = new Set(year.pj.simples.exportExemptShares)

  ;(Object.keys(bracket.shares) as TaxShareKey[]).forEach((key) => {
    const share = bracket.shares[key]
    if (exportMode && exempt.has(key)) {
      breakdown[key] = 0
      payableShare -= share
    } else {
      breakdown[key] = round2(revenue * baseRate * share)
    }
  })

  const rate = Math.max(0, baseRate * payableShare)
  const tax = round2(revenue * rate)
  return { tax, rate, breakdown, bracket }
}

function lucroPresumidoTax(
  revenue: number,
  year: YearData,
  issRate: number,
  exportMode: boolean,
  presumptionIrpj?: number,
  presumptionCsll?: number,
): { tax: number; rate: number; breakdown: Record<string, number> } {
  const lp = year.pj.lucroPresumido
  const baseIrpj = revenue * (presumptionIrpj ?? lp.servicePresumptionIrpj)
  const baseCsll = revenue * (presumptionCsll ?? lp.servicePresumptionCsll)
  let irpj = round2(baseIrpj * lp.irpjRate)
  if (baseIrpj > lp.irpjAdditionalMonthlyThreshold) {
    irpj += round2((baseIrpj - lp.irpjAdditionalMonthlyThreshold) * lp.irpjAdditionalRate)
  }
  const csll = round2(baseCsll * lp.csllRate)
  const pis = exportMode ? 0 : round2(revenue * lp.pisRate)
  const cofins = exportMode ? 0 : round2(revenue * lp.cofinsRate)
  const iss = exportMode ? 0 : round2(revenue * issRate)
  const tax = round2(irpj + csll + pis + cofins + iss)
  return {
    tax,
    rate: revenue > 0 ? tax / revenue : 0,
    breakdown: { irpj, csll, pis, cofins, iss },
  }
}

export function calculatePj(params: {
  revenue: number
  year: YearData
  regime: PjRegime
  annexMode: AnnexMode
  forceFatorR: boolean
  proLabore: number
  rbt12: number
  dependents: number
  costItems: CostItem[]
  issRate: number
  exportMode: boolean
  cnaeCode?: string
  presumptionIrpj?: number
  presumptionCsll?: number
  exportEligible?: boolean
}): PjResult {
  const {
    revenue,
    year,
    regime,
    annexMode,
    forceFatorR,
    proLabore,
    rbt12,
    dependents,
    costItems,
    issRate,
    exportMode,
    cnaeCode = null,
    presumptionIrpj,
    presumptionCsll,
    exportEligible = true,
  } = params

  const applyExport = exportMode && exportEligible

  const effectiveProLabore = Math.max(proLabore, year.minimumWage)
  const payrollForFatorR = forceFatorR
    ? Math.max(rbt12 * year.pj.fatorRThreshold, effectiveProLabore * 12)
    : effectiveProLabore * 12
  const fatorR = rbt12 > 0 ? payrollForFatorR / rbt12 : 1
  const annex =
    regime === 'simples' ? resolveAnnex(annexMode, fatorR, year.pj.fatorRThreshold) : null

  const taxResult =
    regime === 'simples'
      ? simplesTax(revenue, rbt12 || revenue * 12, annex!, year, applyExport)
      : lucroPresumidoTax(
          revenue,
          year,
          issRate,
          applyExport,
          presumptionIrpj,
          presumptionCsll,
        )

  const proLaboreInss = calcIndividualInss(effectiveProLabore, year)
  const proLaboreIrrf = calcIrrf({
    taxableBase: effectiveProLabore - proLaboreInss,
    grossForReducer: effectiveProLabore,
    dependents,
    year,
  })
  const proLaboreNet = round2(effectiveProLabore - proLaboreInss - proLaboreIrrf)

  const afterCompanyTax = round2(revenue - taxResult.tax)
  const distribution = round2(Math.max(0, afterCompanyTax - effectiveProLabore))

  const costLines = breakDownCostItems(costItems)
  const costsMonthlyTotal = sumCostItemsMonthly(costItems)
  const costsAnnualTotal = round2(costsMonthlyTotal * 12)

  const setupAmortizedMonthly = round2(
    costLines
      .filter((c) => c.id === 'opening' || c.id === 'closing')
      .reduce((s, c) => s + c.monthlyTotal, 0),
  )
  const benefitsOutside = round2(
    costLines
      .filter((c) => c.id === 'health' || c.id === 'dental' || c.id === 'life')
      .reduce((s, c) => s + c.monthlyTotal, 0),
  )
  const fixedCostsMonthly = costsMonthlyTotal

  const netTakeHome = round2(proLaboreNet + distribution - costsMonthlyTotal)

  return {
    kind: exportMode ? 'international' : 'national',
    revenue,
    regime,
    annex,
    cnaeCode,
    fatorR: round2(fatorR),
    effectiveTaxRate: taxResult.rate,
    companyTax: taxResult.tax,
    taxBreakdown: taxResult.breakdown,
    proLabore: effectiveProLabore,
    proLaboreInss,
    proLaboreIrrf,
    proLaboreNet,
    distribution,
    fixedCostsMonthly,
    benefitsOutside,
    setupAmortizedMonthly,
    costLines,
    costsMonthlyTotal,
    costsAnnualTotal,
    netTakeHome,
    monthly: {
      grossRevenue: revenue,
      net: netTakeHome,
      costs: costsMonthlyTotal,
      taxes: taxResult.tax,
    },
    annual: {
      grossRevenue: round2(revenue * 12),
      net: round2(netTakeHome * 12),
      costs: costsAnnualTotal,
      taxes: round2(taxResult.tax * 12),
    },
    lines: [
      { id: 'revenue', amount: revenue, kind: 'income' },
      { id: 'companyTax', amount: -taxResult.tax, kind: 'deduction' },
      { id: 'proLaboreInss', amount: -proLaboreInss, kind: 'deduction' },
      { id: 'proLaboreIrrf', amount: -proLaboreIrrf, kind: 'deduction' },
      { id: 'costs', amount: -costsMonthlyTotal, kind: 'deduction' },
      { id: 'net', amount: netTakeHome, kind: 'income' },
    ],
  }
}
