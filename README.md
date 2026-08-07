# Brazil Net Pay Comparator

Compare **CLT**, **domestic PJ** and **international PJ** take-home pay for the Brazilian market.

**Live site:** https://lcarlini.github.io/BrazilNetPayComparator/

> Do **not** open `/docs/` — that folder was removed. There is **one** source `index.html` on `main` (for Vite). The live site is the **build** on the `gh-pages` branch.

## Pages (if the site is blank)

**Settings → Pages → Build and deployment → Branch:** `gh-pages` / `/ (root)`  
Save. Wait ~1 minute.

## Features

- English (default) and Portuguese
- Year-versioned tax tables (`src/data/years/{year}.json`)
- CLT / PJ Nacional / PJ Internacional comparison
- Editable benefits & costs (unit × quantity)
- Termination calculator
- CNAE selection (default: software `6201-5/01`)

## Run locally

```bash
npm install
npm run dev
```

## Disclaimer

Educational estimate only. Confirm with a Brazilian accountant before decisions.
