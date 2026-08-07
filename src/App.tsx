import { useMemo, useState } from 'react'
import {
  calculateClt,
  calculatePj,
  calculateTermination,
  formatBRL,
  formatPct,
  type AnnexMode,
  type BenefitsInput,
  type PjRegime,
  type TerminationType,
} from './calc'
import { AVAILABLE_YEARS, DEFAULT_YEAR, getYearData } from './data'
import {
  CNAE_OPTIONS,
  DEFAULT_CNAE_CODE,
  annexModeFromCnae,
  cnaeLabel,
  getCnae,
  simplesRuleLabel,
} from './data/cnaes'
import { I18nProvider, useI18n } from './i18n'
import { useTheme, type ThemeId } from './theme'
import './app.css'

type TabId = 'compare' | 'termination' | 'sources'

const RELATED = [
  {
    name: 'Receita Federal / IRRF',
    url: 'https://www.gov.br/receitafederal',
  },
  {
    name: 'INSS — tabela de contribuição',
    url: 'https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal',
  },
  {
    name: 'Contabilizei — tabela IR',
    url: 'https://www.contabilizei.com.br/contabilidade-online/tabela-imposto-de-renda/',
  },
  {
    name: 'MARRA CLT — INSS/IRRF 2026',
    url: 'https://www.marraclt.com.br/salario/tabela-inss-2026-novo-desconto-irrf',
  },
  {
    name: 'LC 123/2006 — Simples Nacional',
    url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm',
  },
]

function moneyInput(value: number, onChange: (n: number) => void) {
  return (
    <input
      type="number"
      min={0}
      step={100}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
    />
  )
}

function AppShell() {
  const { t, locale, setLocale } = useI18n()
  const { theme, setTheme } = useTheme()
  const [tab, setTab] = useState<TabId>('compare')
  const [year, setYear] = useState(DEFAULT_YEAR)
  const data = useMemo(() => getYearData(year), [year])

  const [grossClt, setGrossClt] = useState(12000)
  const [invoicePj, setInvoicePj] = useState(18000)
  const [dependents, setDependents] = useState(0)
  const [advanced, setAdvanced] = useState(false)

  const [benefits, setBenefits] = useState<BenefitsInput>(data.clt.defaultBenefitsMonthly)
  const [cnaeCode, setCnaeCode] = useState(DEFAULT_CNAE_CODE)
  const selectedCnae = useMemo(() => getCnae(cnaeCode), [cnaeCode])
  const [pjRegime, setPjRegime] = useState<PjRegime>('simples')
  const [annexMode, setAnnexMode] = useState<AnnexMode>(
    annexModeFromCnae(getCnae(DEFAULT_CNAE_CODE)),
  )
  const [forceFatorR, setForceFatorR] = useState(true)
  const [proLabore, setProLabore] = useState(data.minimumWage)
  const [rbt12, setRbt12] = useState(18000 * 12)
  const [pjHealth, setPjHealth] = useState(data.pj.defaultHealthInsurance)
  const [pjLife, setPjLife] = useState(data.pj.defaultLifeInsurance)
  const [accounting, setAccounting] = useState(data.pj.accountingMonthlyAverage)
  const [opening, setOpening] = useState(data.pj.openingCostAverage)
  const [closing, setClosing] = useState(data.pj.closingCostAverage)
  const [amortize, setAmortize] = useState(36)
  const [issRate, setIssRate] = useState(getCnae(DEFAULT_CNAE_CODE).defaultIssRate)

  const onCnaeChange = (code: string) => {
    const cnae = getCnae(code)
    setCnaeCode(code)
    setAnnexMode(annexModeFromCnae(cnae))
    setIssRate(cnae.defaultIssRate)
    if (cnae.simplesRule === 'fator_r') setForceFatorR(true)
  }

  const [termSalary, setTermSalary] = useState(12000)
  const [hireDate, setHireDate] = useState('2022-03-15')
  const [termDate, setTermDate] = useState('2026-08-07')
  const [termType, setTermType] = useState<TerminationType>('without_cause')
  const [unusedVac, setUnusedVac] = useState(10)
  const [vacMonths, setVacMonths] = useState(8)
  const [fgtsBal, setFgtsBal] = useState(18000)
  const [workedNotice, setWorkedNotice] = useState(false)

  const onYearChange = (next: number) => {
    const y = getYearData(next)
    setYear(next)
    setBenefits(y.clt.defaultBenefitsMonthly)
    setProLabore(y.minimumWage)
    setPjHealth(y.pj.defaultHealthInsurance)
    setPjLife(y.pj.defaultLifeInsurance)
    setAccounting(y.pj.accountingMonthlyAverage)
    setOpening(y.pj.openingCostAverage)
    setClosing(y.pj.closingCostAverage)
    // Keep ISS from selected CNAE rather than year default
    setIssRate(getCnae(cnaeCode).defaultIssRate)
  }

  const clt = useMemo(
    () => calculateClt(grossClt, dependents, benefits, data),
    [grossClt, dependents, benefits, data],
  )

  const pjShared = useMemo(
    () => ({
      revenue: invoicePj,
      year: data,
      regime: pjRegime,
      annexMode,
      forceFatorR: selectedCnae.simplesRule === 'fator_r' ? forceFatorR : false,
      proLabore,
      rbt12: rbt12 || invoicePj * 12,
      dependents,
      healthInsurance: pjHealth,
      lifeInsurance: pjLife,
      accountingMonthly: accounting,
      openingCost: opening,
      closingCost: closing,
      amortizeSetupMonths: amortize,
      issRate,
      cnaeCode: selectedCnae.code,
      presumptionIrpj: selectedCnae.presumptionIrpj,
      presumptionCsll: selectedCnae.presumptionCsll,
      exportEligible: selectedCnae.exportEligible,
    }),
    [
      invoicePj,
      data,
      pjRegime,
      annexMode,
      forceFatorR,
      selectedCnae,
      proLabore,
      rbt12,
      dependents,
      pjHealth,
      pjLife,
      accounting,
      opening,
      closing,
      amortize,
      issRate,
    ],
  )

  const pjNational = useMemo(
    () => calculatePj({ ...pjShared, exportMode: false }),
    [pjShared],
  )

  const pjIntl = useMemo(
    () => calculatePj({ ...pjShared, exportMode: true }),
    [pjShared],
  )

  const termination = useMemo(
    () =>
      calculateTermination(
        {
          salary: termSalary,
          hireDate,
          terminationDate: termDate,
          type: termType,
          unusedVacationDays: unusedVac,
          monthsWorkedInVacationCycle: vacMonths,
          fgtsBalance: fgtsBal,
          workedNotice,
        },
        data,
      ),
    [
      termSalary,
      hireDate,
      termDate,
      termType,
      unusedVac,
      vacMonths,
      fgtsBal,
      workedNotice,
      data,
    ],
  )

  const nets = [
    { id: 'clt', label: t.cltCard, value: clt.equivalentMonthlyCompensation },
    { id: 'nat', label: t.pjNationalCard, value: pjNational.netTakeHome },
    { id: 'intl', label: t.pjIntlCard, value: pjIntl.netTakeHome },
  ]
  const best = nets.reduce((a, b) => (b.value > a.value ? b : a))

  const localeTag = locale === 'pt' ? 'pt' : 'en'
  const brl = (n: number) => formatBRL(n, localeTag)
  const pct = (n: number) => formatPct(n, localeTag)

  const setBenefit = (key: keyof BenefitsInput, value: number) =>
    setBenefits((prev) => ({ ...prev, [key]: value }))

  const tabs: { id: TabId; label: string }[] = [
    { id: 'compare', label: t.tabCompare },
    { id: 'termination', label: t.tabTermination },
    { id: 'sources', label: t.tabSources },
  ]

  return (
    <div className="page">
      <div className="atmosphere" aria-hidden>
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
        <span className="grid-glow" />
        <span className="grain" />
      </div>
      <header className="hero">
        <div className="hero-top">
          <div className="brand-block">
            <p className="eyebrow">Brasil · {year}</p>
            <p className="brand">{t.brand}</p>
          </div>
          <div className="controls">
            <label>
              {t.language}
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as 'en' | 'pt')}
              >
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </label>
            <label>
              {t.theme}
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeId)}
              >
                <option value="black">{t.themeBlack}</option>
                <option value="light">{t.themeLight}</option>
              </select>
            </label>
            <label>
              {t.year}
              <select value={year} onChange={(e) => onYearChange(Number(e.target.value))}>
                {AVAILABLE_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <h1>
          <span className="tagline-line">{t.tagline}</span>
        </h1>
        <p className="lede">{t.subtitle}</p>

        <nav className="tabs" aria-label="Main">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`tab ${tab === item.id ? 'active' : ''}`}
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="hero-rule" aria-hidden />
      </header>

      {tab === 'compare' && (
        <div className="tab-panel" key="compare">
          <section className="panel inputs">
            <div className="panel-head">
              <h2>{t.inputs}</h2>
              <button type="button" className="linkish" onClick={() => setAdvanced((v) => !v)}>
                {advanced ? t.hideAdvanced : t.showAdvanced}
              </button>
            </div>

            <div className="grid-2">
              <label>
                {t.monthlyGrossClt}
                {moneyInput(grossClt, setGrossClt)}
              </label>
              <label>
                {t.monthlyInvoicePj}
                {moneyInput(invoicePj, (n) => {
                  setInvoicePj(n)
                  setRbt12(n * 12)
                })}
              </label>
              <label className="span-2">
                {t.cnae}
                <select value={cnaeCode} onChange={(e) => onCnaeChange(e.target.value)}>
                  {CNAE_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {cnaeLabel(c, locale)}
                    </option>
                  ))}
                </select>
                <span className="field-hint">{t.cnaeHint}</span>
              </label>
              <label>
                {t.dependents}
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={dependents}
                  onChange={(e) => setDependents(Number(e.target.value) || 0)}
                />
              </label>
              <label>
                {t.regime}
                <select
                  value={pjRegime}
                  onChange={(e) => setPjRegime(e.target.value as PjRegime)}
                >
                  <option value="simples">{t.simples}</option>
                  <option value="lucro_presumido">{t.lucroPresumido}</option>
                </select>
              </label>
            </div>

            {advanced && (
              <>
                <h3>{t.benefits}</h3>
                <div className="grid-3">
                  {(
                    [
                      ['healthInsurance', t.health],
                      ['dentalInsurance', t.dental],
                      ['lifeInsurance', t.life],
                      ['mealVoucher', t.meal],
                      ['transportVoucher', t.transport],
                      ['other', t.other],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key}>
                      {label}
                      {moneyInput(benefits[key], (n) => setBenefit(key, n))}
                    </label>
                  ))}
                </div>

                <h3>{t.pjSettings}</h3>
                <div className="grid-3">
                  <label>
                    {t.annex}
                    <select
                      value={annexMode}
                      onChange={(e) => setAnnexMode(e.target.value as AnnexMode)}
                      disabled={
                        pjRegime !== 'simples' || selectedCnae.simplesRule !== 'fator_r'
                      }
                    >
                      <option value="auto">{t.annexAuto}</option>
                      <option value="III">{t.annexIII}</option>
                      <option value="V">{t.annexV}</option>
                    </select>
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={forceFatorR}
                      onChange={(e) => setForceFatorR(e.target.checked)}
                      disabled={
                        pjRegime !== 'simples' ||
                        selectedCnae.simplesRule !== 'fator_r' ||
                        annexMode !== 'auto'
                      }
                    />
                    {t.forceFatorR}
                  </label>
                  <label>
                    {t.proLabore}
                    {moneyInput(proLabore, setProLabore)}
                  </label>
                  <label>
                    {t.rbt12}
                    {moneyInput(rbt12, setRbt12)}
                  </label>
                  <label>
                    {t.pjHealth}
                    {moneyInput(pjHealth, setPjHealth)}
                  </label>
                  <label>
                    {t.pjLife}
                    {moneyInput(pjLife, setPjLife)}
                  </label>
                  <label>
                    {t.accounting}
                    {moneyInput(accounting, setAccounting)}
                  </label>
                  <label>
                    {t.opening}
                    {moneyInput(opening, setOpening)}
                  </label>
                  <label>
                    {t.closing}
                    {moneyInput(closing, setClosing)}
                  </label>
                  <label>
                    {t.amortize}
                    <input
                      type="number"
                      min={1}
                      value={amortize}
                      onChange={(e) => setAmortize(Number(e.target.value) || 1)}
                    />
                  </label>
                  <label>
                    {t.iss}
                    <input
                      type="number"
                      min={0}
                      max={0.05}
                      step={0.005}
                      value={issRate}
                      onChange={(e) => setIssRate(Number(e.target.value) || 0)}
                    />
                  </label>
                </div>
              </>
            )}
          </section>

          <section className="results">
            <div className="panel-head">
              <h2>{t.results}</h2>
              <p className="badge">
                {t.bestNet}: <strong>{best.label}</strong>
              </p>
            </div>

            <div className="cards">
              <article className={`card ${best.id === 'clt' ? 'winner' : ''}`}>
                <h3>{t.cltCard}</h3>
                <p className="metric">{brl(clt.monthly.employerCost)}</p>
                <p className="metric-label">{t.employeeCost}</p>

                <div className="period-grid">
                  <div className="period-block">
                    <p className="period-title">{t.periodMonthly}</p>
                    <dl>
                      <div>
                        <dt>{t.grossPay}</dt>
                        <dd>{brl(clt.monthly.gross)}</dd>
                      </div>
                      <div>
                        <dt>{t.netPay}</dt>
                        <dd>{brl(clt.monthly.net)}</dd>
                      </div>
                      <div>
                        <dt>{t.employeeCost}</dt>
                        <dd>{brl(clt.monthly.employerCost)}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="period-block">
                    <p className="period-title">{t.periodAnnual}</p>
                    <dl>
                      <div>
                        <dt>{t.grossPay}</dt>
                        <dd>{brl(clt.annual.gross)}</dd>
                      </div>
                      <div>
                        <dt>{t.netPay}</dt>
                        <dd>{brl(clt.annual.net)}</dd>
                      </div>
                      <div>
                        <dt>{t.employeeCost}</dt>
                        <dd>{brl(clt.annual.employerCost)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <dl>
                  <div>
                    <dt>{t.equivalentComp}</dt>
                    <dd>{brl(clt.equivalentMonthlyCompensation)}</dd>
                  </div>
                  <div>
                    <dt>{t.cashNet}</dt>
                    <dd>{brl(clt.netCash)}</dd>
                  </div>
                  <div>
                    <dt>{t.thirteenth}</dt>
                    <dd>{brl(clt.thirteenthMonthly)}</dd>
                  </div>
                  <div>
                    <dt>{t.thirteenthNet}</dt>
                    <dd>{brl(clt.thirteenthNet)}</dd>
                  </div>
                  <div>
                    <dt>{t.vacation}</dt>
                    <dd>{brl(clt.vacationMonthly)}</dd>
                  </div>
                  <div>
                    <dt>{t.vacationBonus}</dt>
                    <dd>{brl(clt.vacationBonusMonthly)}</dd>
                  </div>
                  <div>
                    <dt>{t.fgts}</dt>
                    <dd>{brl(clt.fgtsMonthly + clt.fgtsOnThirteenth + clt.fgtsOnVacation)}</dd>
                  </div>
                  <div>
                    <dt>{t.paidHolidays}</dt>
                    <dd>{brl(clt.paidHolidaysMonthly)}</dd>
                  </div>
                  <div>
                    <dt>{t.benefitsTotal}</dt>
                    <dd>{brl(clt.benefitsTotal)}</dd>
                  </div>
                  <div>
                    <dt>{t.employerCost}</dt>
                    <dd>{brl(clt.employerTotalCost)}</dd>
                  </div>
                  <div>
                    <dt>{t.employerCostAnnual}</dt>
                    <dd>{brl(clt.employerTotalCostAnnual)}</dd>
                  </div>
                  <div>
                    <dt>{t.employerInss}</dt>
                    <dd>{brl(clt.employerCharges.inss)}</dd>
                  </div>
                  <div>
                    <dt>{t.rat}</dt>
                    <dd>{brl(clt.employerCharges.rat)}</dd>
                  </div>
                  <div>
                    <dt>{t.thirdParties}</dt>
                    <dd>{brl(clt.employerCharges.thirdParties)}</dd>
                  </div>
                  <div>
                    <dt>{t.uiEstimate}</dt>
                    <dd>{brl(clt.unemploymentInsuranceEstimate)}</dd>
                  </div>
                </dl>
                <p className="note">{t.securityNote}</p>
              </article>

              <article className={`card ${best.id === 'nat' ? 'winner' : ''}`}>
                <h3>{t.pjNationalCard}</h3>
                <p className="metric">{brl(pjNational.netTakeHome)}</p>
                <p className="metric-label">{t.netTakeHome}</p>
                <p className="delta">
                  {t.vsClt}: {brl(pjNational.netTakeHome - clt.equivalentMonthlyCompensation)}
                </p>
                <p className="delta">
                  {t.vsEmployer}: {brl(pjNational.netTakeHome - clt.employerTotalCost)}
                </p>
                <dl>
                  <div>
                    <dt>CNAE</dt>
                    <dd>{pjNational.cnaeCode ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>{t.cnaeRule}</dt>
                    <dd>{simplesRuleLabel(selectedCnae.simplesRule, locale)}</dd>
                  </div>
                  <div>
                    <dt>{t.effectiveTax}</dt>
                    <dd>{pct(pjNational.effectiveTaxRate)}</dd>
                  </div>
                  <div>
                    <dt>{t.companyTax}</dt>
                    <dd>{brl(pjNational.companyTax)}</dd>
                  </div>
                  <div>
                    <dt>{t.annexUsed}</dt>
                    <dd>{pjNational.annex ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>{t.fatorR}</dt>
                    <dd>{pct(pjNational.fatorR)}</dd>
                  </div>
                  <div>
                    <dt>{t.proLaboreNet}</dt>
                    <dd>{brl(pjNational.proLaboreNet)}</dd>
                  </div>
                  <div>
                    <dt>{t.distribution}</dt>
                    <dd>{brl(pjNational.distribution)}</dd>
                  </div>
                  <div>
                    <dt>{t.fixedCosts}</dt>
                    <dd>{brl(pjNational.fixedCostsMonthly)}</dd>
                  </div>
                  <div>
                    <dt>{t.benefitsOutside}</dt>
                    <dd>{brl(pjNational.benefitsOutside)}</dd>
                  </div>
                </dl>
                <p className="note">{t.domesticNote}</p>
              </article>

              <article className={`card ${best.id === 'intl' ? 'winner' : ''}`}>
                <h3>{t.pjIntlCard}</h3>
                <p className="metric">{brl(pjIntl.netTakeHome)}</p>
                <p className="metric-label">{t.netTakeHome}</p>
                <p className="delta">
                  {t.vsClt}: {brl(pjIntl.netTakeHome - clt.equivalentMonthlyCompensation)}
                </p>
                <p className="delta">
                  {t.vsEmployer}: {brl(pjIntl.netTakeHome - clt.employerTotalCost)}
                </p>
                <dl>
                  <div>
                    <dt>CNAE</dt>
                    <dd>{pjIntl.cnaeCode ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>{t.cnaeRule}</dt>
                    <dd>{simplesRuleLabel(selectedCnae.simplesRule, locale)}</dd>
                  </div>
                  <div>
                    <dt>{t.effectiveTax}</dt>
                    <dd>{pct(pjIntl.effectiveTaxRate)}</dd>
                  </div>
                  <div>
                    <dt>{t.companyTax}</dt>
                    <dd>{brl(pjIntl.companyTax)}</dd>
                  </div>
                  <div>
                    <dt>{t.annexUsed}</dt>
                    <dd>{pjIntl.annex ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>{t.fatorR}</dt>
                    <dd>{pct(pjIntl.fatorR)}</dd>
                  </div>
                  <div>
                    <dt>{t.proLaboreNet}</dt>
                    <dd>{brl(pjIntl.proLaboreNet)}</dd>
                  </div>
                  <div>
                    <dt>{t.distribution}</dt>
                    <dd>{brl(pjIntl.distribution)}</dd>
                  </div>
                  <div>
                    <dt>{t.fixedCosts}</dt>
                    <dd>{brl(pjIntl.fixedCostsMonthly)}</dd>
                  </div>
                  <div>
                    <dt>{t.benefitsOutside}</dt>
                    <dd>{brl(pjIntl.benefitsOutside)}</dd>
                  </div>
                </dl>
                <p className="note">{t.exportNote}</p>
                {pjRegime === 'simples' && (
                  <dl className="tax-split">
                    {Object.entries(pjIntl.taxBreakdown).map(([k, v]) => (
                      <div key={k}>
                        <dt>{k.toUpperCase()}</dt>
                        <dd>{brl(v)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </article>
            </div>
          </section>
        </div>
      )}

      {tab === 'termination' && (
        <div className="tab-panel" key="termination">
          <section className="panel termination">
            <h2>{t.termination}</h2>
            <div className="grid-3">
              <label>
                {t.termSalary}
                {moneyInput(termSalary, setTermSalary)}
              </label>
              <label>
                {t.hireDate}
                <input
                  type="date"
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                />
              </label>
              <label>
                {t.termDate}
                <input
                  type="date"
                  value={termDate}
                  onChange={(e) => setTermDate(e.target.value)}
                />
              </label>
              <label>
                {t.termType}
                <select
                  value={termType}
                  onChange={(e) => setTermType(e.target.value as TerminationType)}
                >
                  <option value="without_cause">{t.withoutCause}</option>
                  <option value="resignation">{t.resignation}</option>
                  <option value="agreement">{t.agreement}</option>
                </select>
              </label>
              <label>
                {t.unusedVacationDays}
                <input
                  type="number"
                  min={0}
                  value={unusedVac}
                  onChange={(e) => setUnusedVac(Number(e.target.value) || 0)}
                />
              </label>
              <label>
                {t.vacationCycleMonths}
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={vacMonths}
                  onChange={(e) => setVacMonths(Number(e.target.value) || 0)}
                />
              </label>
              <label>
                {t.fgtsBalance}
                {moneyInput(fgtsBal, setFgtsBal)}
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={workedNotice}
                  onChange={(e) => setWorkedNotice(e.target.checked)}
                />
                {t.workedNotice}
              </label>
            </div>

            <div className="term-result">
              <p className="metric">{brl(termination.total)}</p>
              <p className="metric-label">{t.termTotal}</p>
              <dl>
                <div>
                  <dt>{t.noticeDays}</dt>
                  <dd>{termination.noticeDays}</dd>
                </div>
                <div>
                  <dt>{t.noticePay}</dt>
                  <dd>{brl(termination.noticePay)}</dd>
                </div>
                <div>
                  <dt>{t.propThirteenth}</dt>
                  <dd>{brl(termination.proportionalThirteenth)}</dd>
                </div>
                <div>
                  <dt>{t.accruedVacation}</dt>
                  <dd>
                    {brl(termination.accruedVacation + termination.accruedVacationBonus)}
                  </dd>
                </div>
                <div>
                  <dt>{t.unusedVacPay}</dt>
                  <dd>
                    {brl(termination.unusedVacation + termination.unusedVacationBonus)}
                  </dd>
                </div>
                <div>
                  <dt>{t.fgtsFine}</dt>
                  <dd>{brl(termination.fgtsFine)}</dd>
                </div>
                <div>
                  <dt>{t.fgtsRelease}</dt>
                  <dd>{brl(termination.fgtsRelease)}</dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      )}

      {tab === 'sources' && (
        <div className="tab-panel" key="sources">
          <section className="panel sources">
            <h2>{t.sources}</h2>
            <p>{t.disclaimer}</p>
            <p>{t.howToUpdate}</p>
            <ul>
              {data.sources.map((s: { id: string; title: string; url: string }) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
            <h3>{t.relatedTools}</h3>
            <ul>
              {RELATED.map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <AppShell />
    </I18nProvider>
  )
}
