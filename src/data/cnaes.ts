export type SimplesRule = 'fator_r' | 'III' | 'V'

export interface CnaeOption {
  code: string
  labelEn: string
  labelPt: string
  /** How Simples Nacional annex is chosen for this activity */
  simplesRule: SimplesRule
  /** Typical municipal ISS for Lucro Presumido (0–5%). Averages — city may differ. */
  defaultIssRate: number
  /** Lucro Presumido presumption bases */
  presumptionIrpj: number
  presumptionCsll: number
  /** Eligible for PIS/COFINS/ISS export relief when billing abroad */
  exportEligible: boolean
}

/** Curated CNAEs common for tech / service PJs in Brazil. */
export const CNAE_OPTIONS: CnaeOption[] = [
  {
    code: '6201-5/01',
    labelEn: 'Custom computer software development',
    labelPt: 'Desenvolvimento de programas de computador sob encomenda',
    simplesRule: 'fator_r',
    defaultIssRate: 0.02,
    presumptionIrpj: 0.32,
    presumptionCsll: 0.32,
    exportEligible: true,
  },
  {
    code: '6202-3/00',
    labelEn: 'Development & licensing of customizable software',
    labelPt: 'Desenvolvimento e licenciamento de programas customizáveis',
    simplesRule: 'fator_r',
    defaultIssRate: 0.02,
    presumptionIrpj: 0.32,
    presumptionCsll: 0.32,
    exportEligible: true,
  },
  {
    code: '6203-1/00',
    labelEn: 'Development & licensing of non-customizable software',
    labelPt: 'Desenvolvimento e licenciamento de programas não-customizáveis',
    simplesRule: 'fator_r',
    defaultIssRate: 0.02,
    presumptionIrpj: 0.32,
    presumptionCsll: 0.32,
    exportEligible: true,
  },
  {
    code: '6204-0/00',
    labelEn: 'IT consulting',
    labelPt: 'Consultoria em tecnologia da informação',
    simplesRule: 'fator_r',
    defaultIssRate: 0.05,
    presumptionIrpj: 0.32,
    presumptionCsll: 0.32,
    exportEligible: true,
  },
  {
    code: '6209-1/00',
    labelEn: 'IT support, maintenance and other IT services',
    labelPt: 'Suporte técnico, manutenção e outros serviços de TI',
    simplesRule: 'fator_r',
    defaultIssRate: 0.05,
    presumptionIrpj: 0.32,
    presumptionCsll: 0.32,
    exportEligible: true,
  },
  {
    code: '6311-9/00',
    labelEn: 'Data processing, hosting and related activities',
    labelPt: 'Tratamento de dados, provedores de serviços e hospedagem',
    simplesRule: 'fator_r',
    defaultIssRate: 0.05,
    presumptionIrpj: 0.32,
    presumptionCsll: 0.32,
    exportEligible: true,
  },
  {
    code: '7020-4/00',
    labelEn: 'Business management consulting',
    labelPt: 'Atividades de consultoria em gestão empresarial',
    simplesRule: 'fator_r',
    defaultIssRate: 0.05,
    presumptionIrpj: 0.32,
    presumptionCsll: 0.32,
    exportEligible: true,
  },
  {
    code: '7112-0/00',
    labelEn: 'Engineering services',
    labelPt: 'Serviços de engenharia',
    simplesRule: 'fator_r',
    defaultIssRate: 0.05,
    presumptionIrpj: 0.32,
    presumptionCsll: 0.32,
    exportEligible: true,
  },
  {
    code: '7111-0/00',
    labelEn: 'Architecture and urban planning',
    labelPt: 'Serviços de arquitetura e urbanismo',
    simplesRule: 'fator_r',
    defaultIssRate: 0.05,
    presumptionIrpj: 0.32,
    presumptionCsll: 0.32,
    exportEligible: true,
  },
  {
    code: '6920-6/01',
    labelEn: 'Accounting, bookkeeping and auditing',
    labelPt: 'Atividades de contabilidade',
    simplesRule: 'III',
    defaultIssRate: 0.05,
    presumptionIrpj: 0.32,
    presumptionCsll: 0.32,
    exportEligible: true,
  },
  {
    code: '8599-6/04',
    labelEn: 'Training in professional development',
    labelPt: 'Treinamento em desenvolvimento profissional e gerencial',
    simplesRule: 'III',
    defaultIssRate: 0.05,
    presumptionIrpj: 0.32,
    presumptionCsll: 0.32,
    exportEligible: true,
  },
  {
    code: '7319-0/02',
    labelEn: 'Promotional marketing / advertising services',
    labelPt: 'Promoção de vendas',
    simplesRule: 'fator_r',
    defaultIssRate: 0.05,
    presumptionIrpj: 0.32,
    presumptionCsll: 0.32,
    exportEligible: true,
  },
]

export const DEFAULT_CNAE_CODE = '6201-5/01'

export function getCnae(code: string): CnaeOption {
  return CNAE_OPTIONS.find((c) => c.code === code) ?? CNAE_OPTIONS[0]
}

export function cnaeLabel(cnae: CnaeOption, locale: 'en' | 'pt'): string {
  return `${cnae.code} — ${locale === 'pt' ? cnae.labelPt : cnae.labelEn}`
}

export function annexModeFromCnae(cnae: CnaeOption): 'auto' | 'III' | 'V' {
  if (cnae.simplesRule === 'III') return 'III'
  if (cnae.simplesRule === 'V') return 'V'
  return 'auto'
}

export function simplesRuleLabel(
  rule: SimplesRule,
  locale: 'en' | 'pt',
): string {
  if (locale === 'pt') {
    if (rule === 'fator_r') return 'Anexo III ou V (Fator R)'
    if (rule === 'III') return 'Anexo III'
    return 'Anexo V'
  }
  if (rule === 'fator_r') return 'Annex III or V (Fator R)'
  if (rule === 'III') return 'Annex III'
  return 'Annex V'
}
