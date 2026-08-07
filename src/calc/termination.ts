import { monthsBetween, parseIsoDate, round2, yearsComplete } from './math'
import type { TerminationInputs, TerminationResult, YearData } from './types'

export function calculateTermination(
  input: TerminationInputs,
  year: YearData,
): TerminationResult {
  const hire = parseIsoDate(input.hireDate)
  const end = parseIsoDate(input.terminationDate)
  const years = yearsComplete(hire, end)
  const months = monthsBetween(hire, end)

  const noticeExtra = Math.min(
    year.clt.noticeExtraDaysCap,
    years * year.clt.noticeExtraDaysPerYear,
  )
  const noticeDays = year.clt.noticeBaseDays + noticeExtra
  const daily = input.salary / 30

  const isWithoutCause = input.type === 'without_cause'
  const isAgreement = input.type === 'agreement'
  const isResignation = input.type === 'resignation'

  const noticePay =
    isResignation || input.workedNotice
      ? 0
      : isAgreement
        ? round2(daily * noticeDays * 0.5)
        : round2(daily * noticeDays)

  // Proportional 13th: months worked in calendar year / 12
  const monthsThisYear = end.getMonth() + 1
  const proportionalThirteenth = round2((input.salary / 12) * monthsThisYear)

  const vacationMonths = Math.min(12, Math.max(0, input.monthsWorkedInVacationCycle))
  const accruedVacation = round2((input.salary / 12) * vacationMonths)
  const accruedVacationBonus = round2(accruedVacation * year.clt.vacationBonusRate)

  const unusedVacation = round2(daily * input.unusedVacationDays)
  const unusedVacationBonus = round2(unusedVacation * year.clt.vacationBonusRate)

  let fineRate = 0
  if (isWithoutCause) fineRate = year.clt.fgtsTerminationFineRate
  if (isAgreement) fineRate = year.clt.fgtsTerminationFineRate / 2

  const fgtsFine = round2(input.fgtsBalance * fineRate)
  const fgtsRelease =
    isWithoutCause || isAgreement ? round2(input.fgtsBalance + fgtsFine) : 0

  // Total to worker includes FGTS balance + fine when eligible
  const totalWithFgts = round2(
    noticePay +
      proportionalThirteenth +
      accruedVacation +
      accruedVacationBonus +
      unusedVacation +
      unusedVacationBonus +
      (isResignation ? 0 : input.fgtsBalance + fgtsFine),
  )

  return {
    yearsOfService: years,
    monthsOfService: months,
    noticeDays: isResignation && input.workedNotice ? 0 : noticeDays,
    noticePay,
    proportionalThirteenth,
    accruedVacation,
    accruedVacationBonus,
    unusedVacation,
    unusedVacationBonus,
    fgtsFine,
    fgtsRelease,
    total: totalWithFgts,
    lines: [
      { id: 'notice', amount: noticePay, kind: 'income' },
      { id: 'thirteenth', amount: proportionalThirteenth, kind: 'income' },
      { id: 'accruedVacation', amount: accruedVacation + accruedVacationBonus, kind: 'income' },
      { id: 'unusedVacation', amount: unusedVacation + unusedVacationBonus, kind: 'income' },
      { id: 'fgtsBalance', amount: isResignation ? 0 : input.fgtsBalance, kind: 'benefit' },
      { id: 'fgtsFine', amount: isResignation ? 0 : fgtsFine, kind: 'income' },
      { id: 'total', amount: totalWithFgts, kind: 'income' },
    ],
  }
}
