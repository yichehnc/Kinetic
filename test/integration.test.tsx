/**
 * Integration tests — one test per meaningful user path.
 *
 * ContributionForm  patient ID rejects letters · full step-1 → step-2 → success flow
 * PatientSearch     patient ID rejects letters · locked patient shows LockedPreview
 * Dashboard         opt-in gate · Network Intelligence unlocks when opted in
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ContributionForm } from '../components/ContributionForm';
import { PatientSearch } from '../components/PatientSearch';
import { Dashboard } from '../components/Dashboard';
import { MOCK_PATIENTS, MOCK_HISTORY } from '../constants';

// ─── ContributionForm ─────────────────────────────────────────────────────────

describe('ContributionForm', () => {
  it('strips letters from patient ID and shows an inline error', () => {
    render(<ContributionForm onSubmit={() => {}} />);
    const input = screen.getByPlaceholderText('e.g. 1234 56789 1');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect((input as HTMLInputElement).value).toBe('');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('full flow: step 1 → step 2 → success screen', async () => {
    vi.useFakeTimers();
    render(<ContributionForm onSubmit={() => {}} />);

    // Step 1
    fireEvent.change(screen.getByPlaceholderText('e.g. 1234 56789 1'), { target: { value: '3482 91024 1' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Jane Doe'),      { target: { value: 'Jane Doe' } });
    fireEvent.change(document.querySelector('input[type="date"]') as HTMLInputElement, { target: { value: '1985-04-12' } });
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));

    // Step 2 — pick one per required group
    fireEvent.click(screen.getByRole('button', { name: 'Shoulder' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pain' }));
    fireEvent.click(screen.getByRole('button', { name: 'Acute' }));
    fireEvent.click(screen.getByRole('button', { name: /submit contribution/i }));

    // handleSubmit has a 1 s simulated delay
    await act(async () => { vi.advanceTimersByTime(1100); });
    expect(screen.getByText(/Contribution verified/i)).toBeInTheDocument();
    vi.useRealTimers();
  });
});

// ─── PatientSearch ────────────────────────────────────────────────────────────

const searchProps = {
  patients: MOCK_PATIENTS,
  histories: MOCK_HISTORY,
  unlockedPatients: ['3482 91024 1'],
  credits: 3,
  onUnlock: vi.fn(),
  onNavigateContribute: vi.fn(),
  isOptedIn: true,
};

describe('PatientSearch', () => {
  it('shows a char error when digit + letter are mixed in the search field', () => {
    render(<PatientSearch {...searchProps} />);
    fireEvent.change(screen.getByPlaceholderText(/patient id/i), { target: { value: '1abc' } });
    expect(screen.getByRole('alert').textContent).toMatch(/numbers only/i);
  });

  it('shows LockedPreview with unlock CTA when a locked patient is selected', () => {
    render(<PatientSearch {...searchProps} unlockedPatients={[]} />);
    fireEvent.click(screen.getByText(/sarah jenkins/i));
    expect(screen.getByText(/unlock record/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1 credit/i).length).toBeGreaterThan(0);
  });
});

// ─── Dashboard ────────────────────────────────────────────────────────────────

const dashProps = {
  credits: 5, contributionCount: 12, unlockedCount: 3, lockedAttempts: 0,
  onNavigate: vi.fn(), onOptIn: vi.fn(), onOptOut: vi.fn(),
};

describe('Dashboard', () => {
  it('shows the opt-in gate when the clinic is not connected', () => {
    render(<Dashboard {...dashProps} isOptedIn={false} />);
    expect(screen.getByText(/network connection inactive/i)).toBeInTheDocument();
  });

  it('shows Network Intelligence when opted in', () => {
    render(<Dashboard {...dashProps} isOptedIn={true} />);
    expect(screen.getByText(/network intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/network signals/i)).toBeInTheDocument();
  });
});
