export type TaxShareKey = 'irpj' | 'csll' | 'cofins' | 'pis' | 'cpp' | 'iss'

export interface SourceRef {
  id: string
  title: string
  url: string
}

export interface Bracket {
  upTo: number | null
  rate: number
  deduction: number
}

export interface SimplesBracket {
  upTo: number
  nominalRate: number
  deduction: number
  shares: Record<TaxShareKey, number>
}

export interface IrrfReducer {
  fullExemptionUpTo: number
  partialUpTo: number
  fixedReduction: number
  linearIntercept: number
  linearSlope: number
}

export interface YearData {
  year: number
  sources: SourceRef[]
  minimumWage: number
  inss: {
    ceiling: number
    employeeBrackets: Bracket[]
    individualRateOnPj: number
    autonomousRate: number
  }
  irrf: {
    dependentDeduction: number
    simplifiedDeduction: number
    brackets: Bracket[]
    reducer: IrrfReducer | null
  }
  clt: {
    fgtsRate: number
    fgtsTerminationFineRate: number
    employerInssRate: number
    ratAverageRate: number
    thirdPartyAverageRate: number
    paidHolidaysDaysPerYear: number
    weeklyRestAlreadyInSalary: boolean
    vacationBonusRate: number
    noticeBaseDays: number
    noticeExtraDaysPerYear: number
    noticeExtraDaysCap: number
    unemploymentInsurance: {
      avgMonthlyBenefitShareOfSalary: number
      maxMonths: number
      note: string
    }
    defaultBenefitsMonthly: BenefitsInput
  }
  pj: {
    openingCostAverage: number
    closingCostAverage: number
    accountingMonthlyAverage: number
    certificateDigitalAnnual: number
    municipalFeesAnnualAverage: number
    defaultHealthInsurance: number
    defaultLifeInsurance: number
    issDefaultRate: number
    fatorRThreshold: number
    proLaboreDefaultMonthsOfMinimumWage: number
    simples: {
      annexIII: SimplesBracket[]
      annexV: SimplesBracket[]
      exportExemptShares: TaxShareKey[]
    }
    lucroPresumido: {
      servicePresumptionIrpj: number
      servicePresumptionCsll: number
      irpjRate: number
      irpjAdditionalRate: number
      irpjAdditionalMonthlyThreshold: number
      csllRate: number
      pisRate: number
      cofinsRate: number
      exportExempt: TaxShareKey[]
    }
  }
}

export interface BenefitsInput {
  healthInsurance: number
  dentalInsurance: number
  lifeInsurance: number
  mealVoucher: number
  transportVoucher: number
  other: number
}

export type PjRegime = 'simples' | 'lucro_presumido'
export type AnnexMode = 'auto' | 'III' | 'V'

export interface ComparisonInputs {
  year: number
  monthlyGrossClt: number
  monthlyInvoicePj: number
  dependents: number
  benefits: BenefitsInput
  pjRegime: PjRegime
  annexMode: AnnexMode
  forceFatorR: boolean
  proLabore: number
  rbt12: number
  pjHealthInsurance: number
  pjLifeInsurance: number
  accountingMonthly: number
  openingCost: number
  closingCost: number
  amortizeSetupMonths: number
  issRate: number
  includeEmployerCost: boolean
}

export interface MoneyLine {
  id: string
  amount: number
  kind: 'income' | 'deduction' | 'employer' | 'benefit' | 'info'
}

export interface CltPeriodTotals {
  gross: number
  net: number
  employerCost: number
}

export interface CltResult {
  gross: number
  inss: number
  irrf: number
  netCash: number
  thirteenthGross: number
  thirteenthInss: number
  thirteenthIrrf: number
  thirteenthNet: number
  vacationBonusGross: number
  vacationBonusNetApprox: number
  thirteenthMonthly: number
  vacationMonthly: number
  vacationBonusMonthly: number
  fgtsMonthly: number
  fgtsOnThirteenth: number
  fgtsOnVacation: number
  paidHolidaysMonthly: number
  benefitsTotal: number
  benefits: BenefitsInput
  employerCharges: {
    inss: number
    rat: number
    thirdParties: number
    fgts: number
    total: number
  }
  employerTotalCost: number
  employerTotalCostAnnual: number
  equivalentMonthlyCompensation: number
  unemploymentInsuranceEstimate: number
  monthly: CltPeriodTotals
  annual: CltPeriodTotals
  lines: MoneyLine[]
}

export interface PjResult {
  kind: 'national' | 'international'
  revenue: number
  regime: PjRegime
  annex: 'III' | 'V' | null
  cnaeCode: string | null
  fatorR: number
  effectiveTaxRate: number
  companyTax: number
  taxBreakdown: Record<string, number>
  proLabore: number
  proLaboreInss: number
  proLaboreIrrf: number
  proLaboreNet: number
  distribution: number
  fixedCostsMonthly: number
  benefitsOutside: number
  setupAmortizedMonthly: number
  netTakeHome: number
  lines: MoneyLine[]
}

export type TerminationType = 'without_cause' | 'resignation' | 'agreement'

export interface TerminationInputs {
  salary: number
  hireDate: string
  terminationDate: string
  type: TerminationType
  unusedVacationDays: number
  monthsWorkedInVacationCycle: number
  fgtsBalance: number
  workedNotice: boolean
}

export interface TerminationResult {
  yearsOfService: number
  monthsOfService: number
  noticeDays: number
  noticePay: number
  proportionalThirteenth: number
  accruedVacation: number
  accruedVacationBonus: number
  unusedVacation: number
  unusedVacationBonus: number
  fgtsFine: number
  fgtsRelease: number
  total: number
  lines: MoneyLine[]
}
