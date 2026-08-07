# Brazil Net Pay Comparator

Compare **CLT**, **domestic PJ** and **international PJ** take-home pay for the Brazilian market.

**Live site (GitHub Pages):** https://lcarlini.github.io/BrazilNetPayComparator/

## Features

- English (default) and Portuguese
- Year-versioned tax tables (`src/data/years/{year}.json`) — add a new year without losing older rules
- **CLT**: INSS, IRRF (incl. 2026 reducer), 13th, vacation + 1/3, FGTS, paid holidays, benefits averages, employer charges, unemployment-insurance estimate
- **CLT termination**: hire/end dates, unused vacation, FGTS fine (40%/20%), notice period
- **PJ Nacional**: Simples Nacional (Annex III/V + Fator R) or Lucro Presumido, pró-labore INSS/IRRF, accounting, opening/closing amortized, benefits paid outside
- **PJ Internacional**: export exemptions for PIS, COFINS and ISS (IRPJ/CSLL remain)
- **CNAE** selection (default: software development `6201-5/01`)

## Run

```bash
npm install
npm run dev
```

## Update a tax year

1. Copy `src/data/years/2026.json` to `src/data/years/2027.json`
2. Edit INSS/IRRF/Simples/defaults
3. Register the file in `src/data/index.ts`

## Disclaimer

Educational estimate only. Confirm figures with a Brazilian accountant before making decisions.
