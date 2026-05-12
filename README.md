# Kinetic Network

> **Non-Commercial License** — see [LICENSE](./LICENSE) for terms.

Kinetic is a **B2B SaaS platform** designed to solve an incentive problem in physiotherapy care: patients increasingly see multiple physios across clinics, but clinical history is fragmented because clinics are reluctant to share.

This project explores how **incentive design and credit-based system mechanics** can reduce friction and move network opt-in from ~19% to 80%+.

---

## The Problem

When a patient moves between physio clinics, their treatment history goes with them only as a verbal summary — if at all. Clinics don't share records because:

- They fear being judged by peers
- They fear accelerating patient churn to competitors
- The administrative overhead outweighs the benefit

The result: the next clinician starts from scratch, patients repeat painful onboarding, and care continuity breaks down.

---

## The Solution

Kinetic makes sharing a **selfish, rational act** through a credit-based exchange model:

- Clinics **contribute** structured, anonymised treatment snapshots to earn credits
- Clinics **spend** credits to unlock a patient's prior-care history when they arrive
- The more you give, the more you can access — a closed-loop incentive system

---

## Core Features

### Patient Intake — EHR-Style Clinical Chart
A three-column longitudinal clinical record:
- **Left panel** — patient list with condition search and network status
- **Centre chart** — tabbed view: Summary, Episodes, Treatments, Exercises, Documents, Audit Trail
- **Right panel** — coverage (Medicare/private), network insights, referral path, quick actions
- Responsive across desktop, tablet, and mobile

### Home Exercise Programs (HEP)
- **Exercises tab** synced with external platforms (Physitrack)
- Prescribed program details: exercise name, sets × reps × frequency
- 14-day compliance tracking with colour-coded progress bar
- Live sync indicator, Prescribe and Open-in-platform actions

### Contribute Evidence
- Two-step structured contribution form with inline validation and friendly copy
- AI Import CTA — upload a medical report (PDF/DOCX/image) and Kinetic AI extracts structured fields (demo)
- Draft auto-save to localStorage with corruption and quota guards
- Anonymised snapshot: condition, body region, rehab stage, treatment categories
- No clinician names, clinic names, or subjective clinical notes
- Error boundary prevents form crashes from blanking the page

### Credit System
- Earn credits by contributing patient history
- Spend credits to unlock locked network records
- Network rank and contribution dashboard

### Network & Community
- Clinic-level referral network
- Treatment efficacy signals from aggregate network data
- Audit trail (access log) meeting Australian Privacy Act APP 11 requirements

### Privacy Policy & Terms of Service
- Full Privacy Policy page — APP 11 compliance language, SHA-256 hashing details, NDB scheme reference, data retention and your-rights sections
- Full Terms of Service page — eligibility, credit rules, prohibited use, disclaimers, NSW governing law
- Accessible from footer links throughout the app; Back button returns to Dashboard

---

## Core System Design

### 1. Patient History Snapshot (Not Full SOAP)
Contributions are intentionally limited to a **structured, anonymised snapshot**:
- Patient ID + demographic flags
- Body region and diagnosis category
- Rehab stage and treatment categories used
- Contraindications

No clinician names, subjective notes, outcomes, or reasoning chains. Designed for **continuity**, not peer evaluation.

### 2. Credits (Incentive Mechanism)
- Clinics earn Credits by contributing history
- Credits are spent to unlock patient history on arrival
- Early adopters receive trial credits to solve the cold-start problem
- Unlock is one-time per patient per clinic

### 3. Three-Stage Adoption Model
| Stage | Name | Mechanic |
|---|---|---|
| 1 | Credits | Trial credits + earn through contribution |
| 2 | Continuity | Referral network to grow clinic reach |
| 3 | Community | Prior-care sharing becomes standard of care |

### 4. Privacy & Anonymity by Design
- Contributions are clinic-level, not individual clinician
- No attribution, no subjective content
- Removes fear of treatment being judged by peers
- Referral path shows anonymised clinic hashes — no identifying information

### 5. Accessibility & Motion
- Tooltip accessibility via `aria-describedby`
- Decorative animations gated behind `motion-safe:` (prefers-reduced-motion)
- Smooth scroll respects user motion preferences

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 19 + TypeScript (Vite 6) |
| Styling | Tailwind CSS (CDN) |
| Icons | Lucide React |
| Testing | Vitest + React Testing Library + jsdom |
| CI | GitHub Actions (lint + test on push) |
| Deploy | Vercel (auto-deploy from main) |
| Routing | Single-page (tab-based state) |
| Data | Mock — no backend in this prototype |

---

## Run Locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`

### Run Tests

```bash
npm test
```

36 unit tests covering validation logic, tooltip rendering, and draft persistence.

---

## Project Status

This is a **demo-first MVP** built for pitch and validation purposes.

**Non-goals:**
- Production-grade security or authentication
- Real patient data
- Full clinical validation or regulatory approval

The intent is to demonstrate — through system design and working UI — how sharing clinical history becomes a selfish, rational act driven not by fear, but by the incentive to provide better, continuous care.

---

## Artifacts

| Asset | Link |
|---|---|
| Pitch Deck (Google Slides) | [Open](https://docs.google.com/presentation/d/1vnOLCnq-g8epqxYn9oXAZkPKBEMPnC-_/edit?usp=sharing) |

---

## Workflow

Built using an AI-augmented product and engineering workflow:

- **Claude Code** — engineering, debugging, refactoring, EHR redesign
- **Google AI Studio** — rapid vibe-coding and core logic iteration
- **ChatGPT / Gemini** — systems reasoning and incentive design
- **Claude Design** — UI redesign
- **Stitch** — early UI ideation
- **Manus AI / Canva** — pitch deck and narrative

---

## License

Copyright © 2026 Yichen Cao. Non-commercial use only. See [LICENSE](./LICENSE).  
Commercial licensing enquiries: yichenc2017@gmail.com

---

## Author

Yichen Cao
