import { round2 } from '../calc/math'
import type { YearData } from '../calc/types'

export type CostFrequency = 'monthly' | 'annual' | 'one_time'

export interface CostItem {
  id: string
  labelEn: string
  labelPt: string
  /** Average value of one unit (e.g. R$400 per person). Editable. */
  unitValue: number
  /** How many units (e.g. 3 people in the family plan). */
  quantity: number
  frequency: CostFrequency
  /** Used when frequency is one_time (opening/closing). */
  amortizeMonths?: number
  unitLabelEn: string
  unitLabelPt: string
}

export interface CostItemBreakdown {
  id: string
  labelEn: string
  labelPt: string
  unitValue: number
  quantity: number
  frequency: CostFrequency
  monthlyTotal: number
  annualTotal: number
  formula: string
}

export function costItemMonthlyTotal(item: CostItem): number {
  const raw = item.unitValue * item.quantity
  if (item.frequency === 'monthly') return round2(raw)
  if (item.frequency === 'annual') return round2(raw / 12)
  return round2(raw / Math.max(1, item.amortizeMonths ?? 36))
}

export function costItemAnnualTotal(item: CostItem): number {
  return round2(costItemMonthlyTotal(item) * 12)
}

export function sumCostItemsMonthly(items: CostItem[]): number {
  return round2(items.reduce((sum, item) => sum + costItemMonthlyTotal(item), 0))
}

export function breakDownCostItems(items: CostItem[]): CostItemBreakdown[] {
  return items.map((item) => {
    const monthlyTotal = costItemMonthlyTotal(item)
    const formula =
      item.frequency === 'one_time'
        ? `${item.unitValue} × ${item.quantity} ÷ ${item.amortizeMonths ?? 36} mo`
        : item.frequency === 'annual'
          ? `${item.unitValue} × ${item.quantity} / 12`
          : `${item.unitValue} × ${item.quantity}`
    return {
      id: item.id,
      labelEn: item.labelEn,
      labelPt: item.labelPt,
      unitValue: item.unitValue,
      quantity: item.quantity,
      frequency: item.frequency,
      monthlyTotal,
      annualTotal: round2(monthlyTotal * 12),
      formula,
    }
  })
}

export function costLabel(item: Pick<CostItem, 'labelEn' | 'labelPt'>, locale: 'en' | 'pt') {
  return locale === 'pt' ? item.labelPt : item.labelEn
}

export function unitLabel(item: CostItem, locale: 'en' | 'pt') {
  return locale === 'pt' ? item.unitLabelPt : item.unitLabelEn
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

/** Default CLT employer-paid benefits. Unit averages; change qty (e.g. family size). */
export function defaultCltBenefits(_year: YearData, familySize = 1): CostItem[] {
  return [
    {
      id: 'health',
      labelEn: 'Health plan (convênio)',
      labelPt: 'Convênio médico',
      unitValue: 400,
      quantity: familySize,
      frequency: 'monthly',
      unitLabelEn: 'per person / month',
      unitLabelPt: 'por pessoa / mês',
    },
    {
      id: 'dental',
      labelEn: 'Dental plan',
      labelPt: 'Convênio odontológico',
      unitValue: 45,
      quantity: familySize,
      frequency: 'monthly',
      unitLabelEn: 'per person / month',
      unitLabelPt: 'por pessoa / mês',
    },
    {
      id: 'life',
      labelEn: 'Life insurance',
      labelPt: 'Seguro de vida',
      unitValue: 30,
      quantity: 1,
      frequency: 'monthly',
      unitLabelEn: 'per policy / month',
      unitLabelPt: 'por apólice / mês',
    },
    {
      id: 'meal',
      labelEn: 'Meal voucher',
      labelPt: 'Vale-refeição / alimentação',
      unitValue: 40,
      quantity: 22,
      frequency: 'monthly',
      unitLabelEn: 'R$/day × workdays',
      unitLabelPt: 'R$/dia × dias úteis',
    },
    {
      id: 'transport',
      labelEn: 'Transport voucher',
      labelPt: 'Vale-transporte',
      unitValue: 260,
      quantity: 1,
      frequency: 'monthly',
      unitLabelEn: 'per month',
      unitLabelPt: 'por mês',
    },
  ]
}

/** Default PJ out-of-pocket / company fixed costs. */
export function defaultPjCosts(year: YearData, familySize = 1, amortizeMonths = 36): CostItem[] {
  return [
    {
      id: 'accounting',
      labelEn: 'Accounting (contador)',
      labelPt: 'Contabilidade (contador)',
      unitValue: year.pj.accountingMonthlyAverage,
      quantity: 1,
      frequency: 'monthly',
      unitLabelEn: 'per month',
      unitLabelPt: 'por mês',
    },
    {
      id: 'health',
      labelEn: 'Health plan (paid personally)',
      labelPt: 'Convênio médico (pago por fora)',
      unitValue: 400,
      quantity: familySize,
      frequency: 'monthly',
      unitLabelEn: 'per person / month',
      unitLabelPt: 'por pessoa / mês',
    },
    {
      id: 'dental',
      labelEn: 'Dental plan (paid personally)',
      labelPt: 'Odontológico (pago por fora)',
      unitValue: 45,
      quantity: familySize,
      frequency: 'monthly',
      unitLabelEn: 'per person / month',
      unitLabelPt: 'por pessoa / mês',
    },
    {
      id: 'life',
      labelEn: 'Life insurance (paid personally)',
      labelPt: 'Seguro de vida (pago por fora)',
      unitValue: year.pj.defaultLifeInsurance,
      quantity: 1,
      frequency: 'monthly',
      unitLabelEn: 'per policy / month',
      unitLabelPt: 'por apólice / mês',
    },
    {
      id: 'certificate',
      labelEn: 'Digital certificate (e-CPF/e-CNPJ)',
      labelPt: 'Certificado digital (e-CPF/e-CNPJ)',
      unitValue: year.pj.certificateDigitalAnnual,
      quantity: 1,
      frequency: 'annual',
      unitLabelEn: 'per year',
      unitLabelPt: 'por ano',
    },
    {
      id: 'municipal',
      labelEn: 'Municipal fees / alvará',
      labelPt: 'Taxas da prefeitura / alvará',
      unitValue: year.pj.municipalFeesAnnualAverage,
      quantity: 1,
      frequency: 'annual',
      unitLabelEn: 'per year',
      unitLabelPt: 'por ano',
    },
    {
      id: 'opening',
      labelEn: 'Company opening cost',
      labelPt: 'Custo de abertura da empresa',
      unitValue: year.pj.openingCostAverage,
      quantity: 1,
      frequency: 'one_time',
      amortizeMonths,
      unitLabelEn: 'one-time (amortized)',
      unitLabelPt: 'único (amortizado)',
    },
    {
      id: 'closing',
      labelEn: 'Company closing cost (provision)',
      labelPt: 'Custo de encerramento (provisão)',
      unitValue: year.pj.closingCostAverage,
      quantity: 1,
      frequency: 'one_time',
      amortizeMonths,
      unitLabelEn: 'one-time (amortized)',
      unitLabelPt: 'único (amortizado)',
    },
  ]
}

export function blankCostItem(kind: 'clt' | 'pj'): CostItem {
  return {
    id: uid(kind),
    labelEn: kind === 'clt' ? 'Custom benefit' : 'Custom cost',
    labelPt: kind === 'clt' ? 'Benefício personalizado' : 'Custo personalizado',
    unitValue: 100,
    quantity: 1,
    frequency: 'monthly',
    unitLabelEn: 'per unit / month',
    unitLabelPt: 'por unidade / mês',
  }
}

export function syncAmortizeMonths(items: CostItem[], months: number): CostItem[] {
  return items.map((item) =>
    item.frequency === 'one_time' ? { ...item, amortizeMonths: months } : item,
  )
}
