# Kinetic Network — Session Handover Context

## What this project is

**Kinetic Network** — B2B SaaS MVP / pitch deck demo for physiotherapy clinics.  
Core incentive loop: clinics **contribute** anonymised patient treatment records → **earn credits** → **spend credits** to unlock a specific patient's prior care history when they arrive.  
Not a general knowledge-sharing tool — the patient is the unit of value.

- Repo: `C:\Users\Yichen Cao\OneDrive\Documents\2026\Kinetic\Kinetic`
- GitHub: `https://github.com/yichehnc/Kinetic`
- Live (Vercel auto-deploy from main): check `vercel:status`
- Dev server: `npm run dev` → port 5173 (config in `.claude/launch.json`, name `kinetic-dev`)

---

## Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript, Vite 6 |
| Styling | Tailwind CSS via CDN (no PostCSS/config file) |
| Routing | Tab-based in `App.tsx` — no React Router |
| Persistence | `localStorage` only |
| Testing | Vitest + @testing-library/react — **36 tests, all passing** |
| CI | GitHub Actions — lint + test on push |
| Deploy | Vercel auto-deploy from `main` |

---

## File map

```
App.tsx                         — tab state, credit state, opt-in state, onboarding flag
components/
  Layout.tsx                    — header nav, credits badge, footer (Privacy/Terms links as buttons)
  Dashboard.tsx                 — credit loop bars, stats grid, quick actions, Network Intelligence
  PatientSearch.tsx             — patient ID search + LockedPreview for locked records
  ContributionForm.tsx          — 3-step form; AI import disabled ("coming soon")
  Community.tsx                 — Insights Feed tab + Network Activity tab; DM overlay; Clinic Spotlight
  OnboardingTour.tsx            — 3-step first-visit overlay (kinetic_onboarding_done localStorage key)
  PrivacyPolicy.tsx             — APP 11 / SHA-256 / NDB scheme
  TermsOfService.tsx            — eligibility, credit rules, NSW governing law
  PrivacyExplainer.tsx          — modal sheet explaining data anonymisation
  Referral.tsx                  — referrals tab (not recently modified)
lib/
  contributionValidation.ts     — pure validation: validateStep1/2, parseDraft, buildCompositeCondition
test/
  contributionValidation.test.ts
  tooltip.test.tsx
```

---

## localStorage keys

| Key | Purpose |
|---|---|
| `kinetic_onboarding_done` | Skip onboarding tour after first visit |
| `kinetic_opt_in` | Clinic network opt-in state |
| `kinetic_credits` | Credit balance |
| `kinetic_contribution_draft` | Auto-saved contribution form draft |

---

## Patient ID rules (enforced everywhere)

- **Digits and spaces only** — e.g. `3482 91024 1`
- `inputMode="numeric"` on all patient ID inputs
- Non-digit characters: strip silently + show timed inline error (`role="alert"`)
- Same regex: `/[^\d\s]/`

---

## Key design decisions (do not revert)

1. **Network Intelligence** — removed "Your clinic vs network" comparison (trophy/rank/% above avg). Replaced with "Network Signals" — 4 tagged insight rows drawn from aggregate data. No clinic named, no ranking.
2. **Community tab 2** — was "Clinical Match" (pre-match by condition). Replaced with "Network Activity" — Stripe-style live feed showing contributions/unlocks/milestones with credit badges. `activeTab` type is `'feed' | 'activity'`.
3. **Locked patient UX** — `LockedPreview` component replaces greyed-out tabs. Shows real stats + redacted teasers + "Unlock · 1 Credit" CTA. Mirrors LinkedIn/Stripe gating.
4. **AI Import** — replaced working state-machine button with non-interactive "Coming soon" div. Footer says "AI extraction from PDF, DOCX, image scans — launching soon."
5. **Footer links** — Privacy Policy and Terms of Service are `<button onClick={() => onTabChange(...)}>`, not `<a href="#">`.

---

## Recent commits (newest first)

```
ea74b60  Redesign Network Intelligence — replace comparison with Network Signals
b60357e  Replace Clinical Match tab with Network Activity feed
0c3052b  redesign(community): differentiate Clinical Match from Insights Feed
3396796  chore(contribute): disable AI import upload — mark as coming soon
29cbaf1  feat(contribute): patient ID field — numbers only with inline error
6e81b17  feat(intake): patient ID search — numbers only with inline error
7084745  fix(mobile): increase touch target height on Back and footer nav buttons
d21d371  feat(dashboard): add Network Intelligence section
7cd5a9b  feat(intake): unlock preview with episode count, clinics, redacted teaser
eda58cc  polish(onboarding): consistent card size, tighten copy
c95428e  feat: add Privacy Policy and Terms of Service pages
```

---

## Test command

```bash
npx vitest run --reporter=verbose
# Expected: 2 test files, 36 tests, all passing
```

---

## What has NOT been built yet (known backlog)

- Referrals tab is a placeholder — intentionally left simple
- No real backend / auth — all mock data
- AI import (PDF/DOCX extraction) disabled, planned for later

## Settings tab (built, inline in App.tsx)

- Network Opt-in toggle — awards 5 trial credits on first opt-in
- Credit Auto-Refill toggle — purchases +5 credits on next unlock attempt when balance is zero; persists to `kinetic_auto_refill`
- Audit Log modal — shows last 5 mock events (contributions, unlocks, opt-in, credit grants)
- Data Security & Privacy section — static badges (Encryption ENABLED, Anonymization ACTIVE)
- Reset demo button — clears all localStorage keys and reloads; useful for live demos
