# Kinetic Product Requirement Document (PRD)

## 1. Problem Statement
Kinetic serves ~1,800 independent physiotherapy clinics. Patients increasingly see multiple physios across locations and specialties, yet each clinic currently treats them as a new patient.
Clinics request shared patient history, but adoption is low due to misaligned incentives:
* 71% want to receive shared history
* Only 19% are willing to share their own

**Primary fears:**
* Enabling patient switching to competitors
* Being judged on prior treatment quality

This is not a data availability or policy problem. It is an incentive design and adoption problem.

## 2. Product Goal
Increase clinic opt-in to shared patient history from 19% to 80%+ through a staged, incentive-driven system.
Success depends on:
* Making sharing a rational, self-interested choice
* Reducing time and risk associated with contribution
* Allowing adoption to scale via network effects

## 3. Non-Goals
The system will NOT:
* Expose full clinical notes or raw session data
* Enable clinic-to-clinic direct data transfers
* Rank or publicly score clinical quality
* Force participation

## 4. Core Concept: History Credits
### Summary
Access to shared patient history is governed by a credit-based system.
### Rules
* Clinics must opt in to participate
* Accessing a patient’s prior history costs 1 Kinetic Point
* Contributing a patient history earns 1 Kinetic Point
* Credits are tied to clinics, not individual clinicians
### Rationale
This creates a closed incentive loop where contribution is required for continued benefit.

## 5. Adoption Phases (System Behavior Over Time)
### Phase 1 – Early Adopters (19% → ~35%)
**Objective:** Deliver immediate value to high-need clinics.
**System Requirements:**
* Clinics can opt in/out at the organisation level
* Early adopters receive a configurable number of trial credits
* Trial credits can be spent but not earned without contribution

### Phase 2 – Network Effect Threshold (~35% → ~60%)
**Objective:** Make non-participation operationally inefficient.
**System Requirements:**
* Patients increasingly arrive with available prior history
* Clinics with no credits receive clear but neutral access-block messaging
* Contribution increases future access depth and speed

### Phase 3 – Competitive Necessity (~60% → 80%+)
**Objective:** Establish shared history as standard practice.
**System Requirements:**
* History access reliability and latency must meet intake workflow needs
* Contribution-based advantages must scale (e.g. faster availability)

## 6. What Data Is Shared
### Included (Structured Only)
* Injury / condition timeline
* What has / has not worked
* Contraindications and red flags
* Outcome status (resolved / ongoing / plateaued)

### Explicitly Excluded
* Session-by-session notes
* Subjective commentary
* Pricing, visit frequency
* Clinician identity attribution

## 7. Contribution Workflow
### When Contribution Occurs
* Patient discharge
* Patient books with another clinic and consents
* Voluntary contribution by clinic

### Contribution Format
* Mandatory structured clinical template
* Keyword-based fields
* Estimated completion time: < 5 minutes

## 8. Patient Consent Model
### Consent Timing
* First-visit intake form
* End-of-care / discharge flow

### Consent Rules
* Consent is patient-initiated
* Consent applies to future bookings
* Clinics do not manually send data

## 9. Referral Incentive
### Mechanism
* A clinic can refer another clinic to contribute one history
* Both clinics receive credits upon successful contribution

## 10. Safeguards Against Switching Fear
### Cooling-Off Window
* History becomes shareable only after a configurable delay (e.g. 30 days post last session)
### Attribution Controls
* Receiving clinics cannot see source clinic or clinician identity

## 11. Success Metrics
### Primary Metrics
* Clinic opt-in rate
* % of clinics with positive credit balance
* History access per intake

### Secondary Metrics
* Average intake time reduction
* Contribution completion time
* Referral-driven opt-ins
