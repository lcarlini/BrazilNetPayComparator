import { calcEmployeeInss, calcIrrf, round2 } from './math'
import type { BenefitsInput, CltResult, YearData } from './types'

function sumBenefits(b: BenefitsInput): number {
  return (
    b.healthInsurance +
    b.dentalInsurance +
    b.lifeInsurance +
    b.mealVoucher +
    b.transportVoucher +
    b.other
  )
}

export function calculateClt(
  salary: number,
  dependents: number,
  benefits: BenefitsInput,
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

  // 13th salary is taxed separately (INSS + IRRF on its own base)
  const thirteenthGross = salary
  const thirteenthInss = calcEmployeeInss(thirteenthGross, year)
  const thirteenthIrrf = calcIrrf({
    taxableBase: thirteenthGross - thirteenthInss,
    grossForReducer: thirteenthGross,
    dependents,
    year,
  })
  const thirteenthNet = round2(thirteenthGross - thirteenthInss - thirteenthIrrf)

  // Vacation 1/3 is an extra cash entitlement; approximate net with monthly effective rate
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

  const benefitsTotal = round2(sumBenefits(benefits))
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

  // Annual gross: 12 salaries + 13th + vacation 1/3
  const annualGross = round2(salary * 12 + thirteenthGross + vacationBonusGross)
  // Annual net: 12 monthly nets + 13th net + vacation 1/3 net
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
    benefits: { ...benefits },
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
      { id: 'thirteenth', amount: thirteenthMonthly, kind: 'benefit' },
      { id: 'vacation', amount: vacationMonthly, kind: 'benefit' },
      { id: 'vacationBonus', amount: vacationBonusMonthly, kind: 'benefit' },
      { id: 'fgts', amount: fgtsMonthly + fgtsOnThirteenth + fgtsOnVacation, kind: 'benefit' },
      { id: 'paidHolidays', amount: paidHolidaysMonthly, kind: 'info' },
      { id: 'benefits', amount: benefitsTotal, kind: 'benefit' },
      { id: 'employerTotal', amount: employerTotalCost, kind: 'employer' },
      { id: 'employerTotalAnnual', amount: employerTotalCostAnnual, kind: 'employer' },
      { id: 'annualGross', amount: annualGross, kind: 'income' },
      { id: 'annualNet', amount: annualNet, kind: 'income' },
      { id: 'equivalent', amount: equivalentMonthlyCompensation, kind: 'income' },
      { id: 'uiEstimate', amount: unemploymentInsuranceEstimate, kind: 'info' },
    ],
  }
}
