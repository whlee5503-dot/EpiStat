# EpiStat — Free Epidemiology Statistics Calculator

[![Live Demo](https://img.shields.io/badge/Live%20Demo-epistat--phtlab.org-brightgreen)](https://epistat.phtlab.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/whlee5503-dot/EpiStat/blob/main/LICENSE)
[![Built with React](https://img.shields.io/badge/Built%20with-React%20%2B%20TypeScript-blue)](https://react.dev)

## 📢 Status

- **Digital Public Goods (DPG):** Submitted to the [Digital Public Goods Alliance (DPGA)](https://digitalpublicgoods.net) — under review (GID0094071)
- **Academic Citation:** [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21940895.svg)](https://doi.org/10.5281/zenodo.21940895)
- Part of the [PublicHealth Tech Lab](https://phtlab.org) family of offline-first public health tools, alongside [EpiCalc](https://epi.chem-health-calc.com), [EpiLog](https://epilog-d72.pages.dev), [EpiAid](https://epiaid.pages.dev), and [VaxGuard](https://vaxguard.pages.dev)

---

### 🌐 SDG Alignment

EpiStat contributes to the UN Sustainable Development Goal 3 (Good Health
and Well-being), specifically Target 3.d: strengthening early warning
systems and risk reduction for national and global health risks. By
providing free, fully offline-capable epidemiologic statistics tools,
EpiStat supports evidence-based decision-making for public health workers
in low-resource settings worldwide.

[![SDG 3](https://img.shields.io/badge/SDG-3%20Good%20Health-brightgreen)](https://sdgs.un.org/goals/goal3)

---

A free, mobile-friendly, open-source web application reimplementing the
core statistical modules of epidemiologic practice — stratified analysis,
contingency tables, standardized mortality ratios, matched case-control
studies, dose-response trend testing, WHO Child Growth Standards, person-time
analysis, and sample size / power calculations — designed for field
epidemiologists, MPH students, and public health practitioners worldwide.

> 🌍 **Mission**: To make essential epidemiologic statistics tools freely
> accessible to health workers in low-resource settings, including fully
> offline use in areas with limited or no internet connectivity.

---

## 🖥️ Live Demo

**<https://epistat.phtlab.org>**

No login required. Works on mobile. English / 한국어 / French.

---

## 📱 Install as Mobile App (PWA)

EpiStat can be installed as a native-like app on your smartphone or
desktop — no App Store needed.

- **Android (Chrome)**: Menu (⋮) → "Add to Home Screen"
- **iPhone (Safari)**: Share (□↑) → "Add to Home Screen"
- **Desktop (Chrome/Edge)**: Address bar install icon → "Install"

EpiStat is platform-independent — compatible with Android, iOS, and any
modern web browser. Once installed, every module — including ones you
haven't opened yet — is available offline immediately, not only after
you've visited it once while online.

---

## ✨ Features

### 📊 Statistical Modules

- **Stratified Analysis** — Mantel-Haenszel adjusted odds ratio & risk
  ratio, Breslow-Day homogeneity test, Fisher's / Mid-P exact tests
- **R × C Tables** — Pearson chi-square test of independence for
  contingency tables of any size
- **SMR (Standardized Mortality Ratio)** — seven significance test /
  confidence interval methods (Mid-P, Fisher's, Byar, normal
  approximation, Rothman-Greenland, Ury & Wiggins, Vandenbroucke)
- **Matched Case-Control** — McNemar's test and matched odds ratio for
  1:1 pair-matched data
- **Dose-Response** — extended Mantel-Haenszel chi-square for trend
  across ordered exposure levels
- **WHO Child Growth Standards** — Weight-for-Age, Length/Height-for-Age,
  Weight-for-Length/Height, and BMI-for-Age z-scores and classification
- **Person-Time** — incidence rate ratio and difference, stratified and
  crude
- **Sample Size & Power** — 9 study-design subtypes: proportion, unmatched
  case-control, cohort/RCT, mean difference (sample size), and their
  power-analysis counterparts

### 🧪 Validation

Every module is independently validated against
[OpenEpi](https://www.openepi.com) (v3.01, Sullivan & Dean, Emory
University), the long-established reference implementation for
epidemiologic statistics, cross-checked case-by-case against OpenEpi's
own live calculator and documentation. Full validation methodology and
results are published in [`VALIDATION.md`](./VALIDATION.md).

---

## 🎯 Target Users

- Field epidemiologists & public health workers in low-resource settings
- MPH students & public health faculty
- Medical students & clinical researchers
- Outbreak investigation and surveillance teams

---

## 🔒 Privacy & Data Policy

EpiStat does not collect, store, or transmit any personally identifiable
information (PII). All calculations are performed entirely on the client
side (browser/device). No data is sent to any external server, and no
login is required. Safe for use in sensitive public health field
contexts.

---

## ⚡ Offline Support

EpiStat is built as a fully offline-capable Progressive Web App:

- **Full precache**: every built asset — including the JS for all 11
  statistical modules — is cached at install time via `vite-plugin-pwa` /
  Workbox, so every module works offline immediately after first
  install, not only after being visited once while online
- **Code splitting**: each module loads as its own lazy-loaded chunk,
  keeping the initial load small while still guaranteeing full offline
  availability once installed
- **Error isolation**: a per-module error boundary means a failure in
  one module (e.g. a dropped connection mid-load) never takes down the
  rest of the app

---

## 🛠️ Tech Stack

| Category | Technology |
| --- | --- |
| Frontend | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | CSS Variables |
| i18n | English / 한국어 / Français |
| PWA / SW | vite-plugin-pwa + Workbox |
| Deployment | Cloudflare Pages |

---

## 🚀 Getting Started

```
# Clone the repository
git clone https://github.com/whlee5503-dot/EpiStat.git
cd EpiStat

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📐 Statistical Methods

EpiStat reimplements the statistical formulas used across common
epidemiologic study designs (Mantel-Haenszel methods, exact hypergeometric
and binomial tests, Poisson-based confidence intervals, WHO LMS z-score
methodology, and standard sample-size/power formulas from Kelsey, Fleiss,
Schlesselman, and Rosner). See [`VALIDATION.md`](./VALIDATION.md) for the
full formula-by-formula validation record against OpenEpi and independent
reference implementations.

---

## 📁 Project Structure

```
epistat/
├── src/
│   ├── components/        # One Analysis + Input component pair per module
│   ├── lib/                # Core calculation functions per module
│   │   └── who/            # WHO Child Growth Standards reference tables
│   └── i18n/                # English / Korean / French translations
├── public/
├── VALIDATION.md
└── index.html
```

---

## 🤝 Contributing

EpiStat is designed in accordance with the
[Principles for Digital Development](https://digitalprinciples.org/).

Contributions are welcome! This project is especially looking for:

- **Formula validation** — epidemiologists and biostatisticians welcome
- **Translations** — additional languages for global health reach
- **Field usability feedback** — from public health workers in
  low-resource settings
- **Bug reports & feature requests** — via GitHub Issues

---

## 📄 License

This project is licensed under the **MIT License** — see the
[LICENSE](https://github.com/whlee5503-dot/EpiStat/blob/main/LICENSE) file
for details.

Free to use, modify, and distribute — including for use in developing
countries and resource-limited settings.

---

## 👨‍💻 About the Developer

**Won Ho Lee, Ph.D.**

- Chemical Engineering (PhD) | MPH | MDiv
- Taught Biostatistics & Foundations of Public Health — University of Utah
  Asia Campus (adjunct, 2 fall semesters)
- University of Utah MPH Alumni
- Founder, [PublicHealth Tech Lab](https://phtlab.org)

EpiStat was built out of a deep, enduring connection to public health —
and a hope that essential statistical tools should be accessible to
every health worker, regardless of where they work.

---

## 📬 Feedback

Found a bug or have a suggestion?

- Open a [GitHub Issue](https://github.com/whlee5503-dot/EpiStat/issues)

---

> *"Essential public health tools should be accessible to every health
> worker, regardless of where they work."*