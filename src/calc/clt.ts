import { breakDownCostItems, sumCostItemsMonthly, type CostItem } from '../data/costCatalog'
import { calcEmployeeInss, calcIrrf, round2 } from './math'
import type { CltResult, YearData } from './types'

export function calculateClt(
  salary: number,
  dependents: number,
  benefitItems: CostItem[],
  year: YearData,
): CltResult {
  const inss = calcEmployeeInss(salary, year)
  const irrf = calcIrrf({
    taxableBase: salary - inss,
    grossForReducer: salary,
    dependents,
    year,
  })
  const netCash = round2(salary - inss - irrf)

  const thirteenthGross = salary
  const thirteenthInss = calcEmployeeInss(thirteenthGross, year)
  const thirteenthIrrf = calcIrrf({
    taxableBase: thirteenthGross - thirteenthInss,
    grossForReducer: thirteenthGross,
    dependents,
    year,
  })
  const thirteenthNet = round2(thirteenthGross - thirteenthInss - thirteenthIrrf)

  const vacationBonusGross = round2(salary * year.clt.vacationBonusRate)
  const netRate = salary > 0 ? netCash / salary : 1
  const vacationBonusNetApprox = round2(vacationBonusGross * netRate)

  const thirteenthMonthly = round2(salary / 12)
  const vacationMonthly = round2(salary / 12)
  const vacationBonusMonthly = round2(vacationBonusGross / 12)

  const fgtsMonthly = round2(salary * year.clt.fgtsRate)
  const fgtsOnThirteenth = round2(thirteenthMonthly * year.clt.fgtsRate)
  const fgtsOnVacation = round2((vacationMonthly + vacationBonusMonthly) * year.clt.fgtsRate)

  const paidHolidaysMonthly = round2(
    (salary / 30) * (year.clt.paidHolidaysDaysPerYear / 12),
  )

  const employerInss = round2(salary * year.clt.employerInssRate)
  const rat = round2(salary * year.clt.ratAverageRate)
  const thirdParties = round2(salary * year.clt.thirdPartyAverageRate)
  const employerFgts = round2(fgtsMonthly + fgtsOnThirteenth + fgtsOnVacation)
  const employerChargesTotal = round2(employerInss + rat + thirdParties + employerFgts)

  const benefitLines = breakDownCostItems(benefitItems)
  const benefitsTotal = sumCostItemsMonthly(benefitItems)

  const employerTotalCost = round2(
    salary +
      thirteenthMonthly +
      vacationMonthly +
      vacationBonusMonthly +
      employerChargesTotal +
      benefitsTotal,
  )
  const employerTotalCostAnnual = round2(employerTotalCost * 12)

  const equivalentMonthlyCompensation = round2(
    netCash +
      thirteenthMonthly +
      vacationMonthly +
      vacationBonusMonthly +
      fgtsMonthly +
      fgtsOnThirteenth +
      fgtsOnVacation +
      benefitsTotal,
  )

  const unemploymentInsuranceEstimate = round2(
    salary *
      year.clt.unemploymentInsurance.avgMonthlyBenefitShareOfSalary *
      year.clt.unemploymentInsurance.maxMonths,
  )

  const annualGross = round2(salary * 12 + thirteenthGross + vacationBonusGross)
  const annualNet = round2(netCash * 12 + thirteenthNet + vacationBonusNetApprox)

  return {
    gross: salary,
    inss,
    irrf,
    netCash,
    thirteenthGross,
    thirteenthInss,
    thirteenthIrrf,
    thirteenthNet,
    vacationBonusGross,
    vacationBonusNetApprox,
    thirteenthMonthly,
    vacationMonthly,
    vacationBonusMonthly,
    fgtsMonthly,
    fgtsOnThirteenth,
    fgtsOnVacation,
    paidHolidaysMonthly,
    benefitsTotal,
    benefitLines,
    benefits: {
      healthInsurance: benefitLines.find((b) => b.id === 'health')?.monthlyTotal ?? 0,
      dentalInsurance: benefitLines.find((b) => b.id === 'dental')?.monthlyTotal ?? 0,
      lifeInsurance: benefitLines.find((b) => b.id === 'life')?.monthlyTotal ?? 0,
      mealVoucher: benefitLines.find((b) => b.id === 'meal')?.monthlyTotal ?? 0,
      transportVoucher: benefitLines.find((b) => b.id === 'transport')?.monthlyTotal ?? 0,
      other: round2(
        benefitsTotal -
          (benefitLines.find((b) => b.id === 'health')?.monthlyTotal ?? 0) -
          (benefitLines.find((b) => b.id === 'dental')?.monthlyTotal ?? 0) -
          (benefitLines.find((b) => b.id === 'life')?.monthlyTotal ?? 0) -
          (benefitLines.find((b) => b.id === 'meal')?.monthlyTotal ?? 0) -
          (benefitLines.find((b) => b.id === 'transport')?.monthlyTotal ?? 0),
      ),
    },
    employerCharges: {
      inss: employerInss,
      rat,
      thirdParties,
      fgts: employerFgts,
      total: employerChargesTotal,
    },
    employerTotalCost,
    employerTotalCostAnnual,
    equivalentMonthlyCompensation,
    unemploymentInsuranceEstimate,
    monthly: {
      gross: salary,
      net: netCash,
      employerCost: employerTotalCost,
    },
    annual: {
      gross: annualGross,
      net: annualNet,
      employerCost: employerTotalCostAnnual,
    },
    lines: [
      { id: 'gross', amount: salary, kind: 'income' },
      { id: 'inss', amount: -inss, kind: 'deduction' },
      { id: 'irrf', amount: -irrf, kind: 'deduction' },
      { id: 'netCash', amount: netCash, kind: 'income' },
      { id: 'benefits', amount: benefitsTotal, kind: 'benefit' },
      { id: 'employerTotal', amount: employerTotalCost, kind: 'employer' },
      { id: 'equivalent', amount: equivalentMonthlyCompensation, kind: 'income' },
    ],
  }
}
