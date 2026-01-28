# Kinetic

Kinetic is a **B2B SaaS concept and interactive prototype** designed to solve a core incentive problem in physiotherapy care:  
patients increasingly see multiple physios across clinics, but clinical history is fragmented because clinics are reluctant to share.

This project explores how **incentive design, anonymity, and system mechanics** — rather than policy enforcement — can move network opt-in from ~19% to 80%+.

---

## Purpose

The goal of Kinetic is to enable **patient-consented, privacy-safe continuity of care** across competing clinics by making information sharing a **selfish, rational decision**, not an altruistic one.

Key principles:
- Remove fear of peer judgment
- Prevent competitive leakage
- Reduce clinician time cost
- Align contribution with immediate benefit

---

## Core System Functions

### 1. Continuity Snapshot (Not Full SOAP)
- Clinics contribute a **structured, anonymised snapshot** of care:
  - Body region
  - Diagnosis category
  - Rehab stage
  - Treatment categories
  - Contraindications
- No clinician names, clinic names, subjective notes, outcomes, or reasoning chains
- Designed for **continuity**, not evaluation

### 2. Kinetic Points (Incentive Mechanism)
- Clinics earn **Kinetic Points** by contributing history
- Points are spent to unlock patient history when patients arrive with prior care
- Early adopters receive trial points to solve cold start
- Unlock is one-time per patient per clinic

### 3. Three-Stage Adoption Model
- **Stage 1 – Credits:** Early adopters + trial points
- **Stage 2 – Continuity:** Patients increasingly arrive with history
- **Stage 3 – Community:** Contribution becomes a standard of care signal

### 4. Privacy & Anonymity by Design
- Contributions are **clinic-level**, not individual
- No attribution, no subjective content
- Designed to remove fear of treatment being judged

---

## Artifacts & Links

### 🔗 Interactive Prototype (Google AI Studio)
Responsive design for **desktop, tablet, and mobile**  
> Google account required

https://ai.studio/apps/drive/1qvfc3ZqI0INFEAQDfAO3mRsvSWzIGBz8

---

### 🎥 Walkthrough Recording
Loom walkthrough explaining:
- System behavior
- Incentive mechanics
- Opt-in logic
- Demo flows

> (Link to be added)

---

### 💻 GitHub Repository
Source code and demo logic for the Kinetic prototype

https://github.com/yichehnc/Kinetic

---

### 📊 Pitch Deck (Google Slides)
5-slide pitch covering:
- Problem framing
- Incentive design
- Adoption strategy (19% → 80%)
- Validation approach

https://docs.google.com/presentation/d/1vnOLCnq-g8epqxYn9oXAZkPKBEMPnC-_/edit?usp=sharing&ouid=105749789515616551075&rtpof=true&sd=true

---

## Process & Workflow

This project was built using an **AI-augmented product and engineering workflow** to move rapidly from system design to a working prototype.

Different AI tools were used intentionally at different stages:

- **Google AI Studio**  
  Vibe coding and rapid iteration on core logic flows

- **Claude Code (Sonnet 4.5)**  
  Debugging, refactoring, and token-efficient engineering support

- **Stitch**  
  Early UI ideation and layout exploration

- **ChatGPT & Gemini 3 Pro**  
  Systems reasoning, incentive design, and translating high-level ideas into precise, executable prompts

- **Manus AI & Canva**  
  Pitch deck construction and narrative refinement

The emphasis throughout was **system behavior and incentive alignment**, not visual polish.

---

## Status

This is a **conceptual, demo-first prototype**.

Non-goals:
- Production-grade security
- Real patient data
- Full clinical validation

The project is intended to demonstrate **how incentive design can unlock network effects in healthcare systems**.

---

## Author

Built by Yi  
Background: architecture → UX → software engineering  
Focus: systems design, incentives, and clinician-first workflows

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1qvfc3ZqI0INFEAQDfAO3mRsvSWzIGBz8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
