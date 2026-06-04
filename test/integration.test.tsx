/**
 * Integration tests — user flows across components.
 *
 * Coverage:
 *   ContributionForm  — step navigation, step-1 & step-2 validation, patient ID char filtering
 *   PatientSearch     — patient ID char error, search result, locked-patient preview
 *   Dashboard         — opt-in/out rendering, credit loop, Network Intelligence
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ContributionForm } from '../components/ContributionForm';
import { PatientSearch } from '../components/PatientSearch';
import { Dashboard } from '../components/Dashboard';
import { MOCK_PATIENTS, MOCK_HISTORY } from '../constants';

// ─── helpers ──────────────────────────────────────────────────────────────────

const noop = () => {};

// Fill step-1 fields and advance to step 2.
function advanceToStep2() {
  fireEvent.change(screen.getByPlaceholderText('e.g. 1234 56789 1'), {
    target: { value: '3482 91024 1' },
  });
  fireEvent.change(screen.getByPlaceholderText('e.g. Jane Doe'), {
    target: { value: 'Jane Doe' },
  });
  // Date input has no placeholder — find it by type
  const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
  fireEvent.change(dateInput, { target: { value: '1985-04-12' } });
  fireEvent.click(screen.getByRole('button', { name: /next/i }));
}

// ─── ContributionForm ─────────────────────────────────────────────────────────

describe('ContributionForm', () => {
  it('renders step 1 with patient ID, name, and DOB fields', () => {
    render(<ContributionForm onSubmit={noop} />);
    expect(screen.getByPlaceholderText('e.g. 1234 56789 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Jane Doe')).toBeInTheDocument();
    expect(document.querySelector('input[type="date"]')).toBeInTheDocument();
  });

  it('disables the Next step button when step-1 fields are empty', () => {
    render(<ContributionForm onSubmit={noop} />);
    // Button is disabled when nothing is filled in — form prevents advancing
    expect(screen.getByRole('button', { name: /next step/i })).toBeDisabled();
  });

  it('strips non-digit characters from patient ID and shows an inline char error', () => {
    render(<ContributionForm onSubmit={noop} />);
    const idInput = screen.getByPlaceholderText('e.g. 1234 56789 1');

    fireEvent.change(idInput, { target: { value: 'abc' } });

    // Letters must be stripped from the input value
    expect((idInput as HTMLInputElement).value).toBe('');
    // Char-level error appears (role="alert")
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('accepts digits and spaces in patient ID without triggering a char error', () => {
    render(<ContributionForm onSubmit={noop} />);
    const idInput = screen.getByPlaceholderText('e.g. 1234 56789 1');

    fireEvent.change(idInput, { target: { value: '3482 91024 1' } });

    expect((idInput as HTMLInputElement).value).toBe('3482 91024 1');
    // No char-error alert when input is valid
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('advances to step 2 when all step-1 fields are correctly filled', () => {
    render(<ContributionForm onSubmit={noop} />);
    advanceToStep2();
    // Step 2 renders body-region picker buttons
    expect(screen.getByText('Shoulder')).toBeInTheDocument();
  });

  it('disables the Submit button on step 2 when no classifications are selected', () => {
    render(<ContributionForm onSubmit={noop} />);
    advanceToStep2();
    expect(screen.getByRole('button', { name: /submit contribution/i })).toBeDisabled();
  });

  it('advances to the success screen when step 2 classifications are completed', async () => {
    vi.useFakeTimers();
    render(<ContributionForm onSubmit={noop} />);
    advanceToStep2();

    // Pick one option per required group
    fireEvent.click(screen.getByRole('button', { name: 'Shoulder' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pain' }));
    fireEvent.click(screen.getByRole('button', { name: 'Acute' }));

    fireEvent.click(screen.getByRole('button', { name: /submit contribution/i }));

    // handleSubmit has a 1000ms simulated delay before advancing to step 3
    await act(async () => { vi.advanceTimersByTime(1100); });

    expect(screen.getByText(/Contribution verified/i)).toBeInTheDocument();
    vi.useRealTimers();
  });
});

// ─── PatientSearch ────────────────────────────────────────────────────────────

const defaultSearchProps = {
  patients: MOCK_PATIENTS,
  histories: MOCK_HISTORY,
  unlockedPatients: ['3482 91024 1'],
  credits: 3,
  onUnlock: vi.fn(),
  onNavigateContribute: vi.fn(),
  isOptedIn: true,
};

describe('PatientSearch', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the patient ID search input', () => {
    render(<PatientSearch {...defaultSearchProps} />);
    expect(screen.getByPlaceholderText(/patient id/i)).toBeInTheDocument();
  });

  it('shows an inline char error when a digit + letter combination is typed', () => {
    // handleSearch triggers only when the input has a digit (ID mode);
    // mixing digits + letters (e.g. "1abc") causes the error.
    render(<PatientSearch {...defaultSearchProps} />);
    const input = screen.getByPlaceholderText(/patient id/i);

    fireEvent.change(input, { target: { value: '1abc' } });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert').textContent).toMatch(/numbers only/i);
  });

  it('does not show a char error when only digits and spaces are typed', () => {
    render(<PatientSearch {...defaultSearchProps} />);
    const input = screen.getByPlaceholderText(/patient id/i);

    fireEvent.change(input, { target: { value: '3482' } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('filters the patient list as the user types a name', () => {
    render(<PatientSearch {...defaultSearchProps} />);
    const input = screen.getByPlaceholderText(/patient id/i);

    fireEvent.change(input, { target: { value: 'Sarah' } });

    expect(screen.getByText(/sarah jenkins/i)).toBeInTheDocument();
    // Other patients should not be in the filtered list
    expect(screen.queryByText(/michael chen/i)).not.toBeInTheDocument();
  });

  it('shows LockedPreview content when a locked patient is selected', () => {
    render(<PatientSearch {...defaultSearchProps} unlockedPatients={[]} />);

    // Sarah Jenkins appears in the default (unfiltered) list — click her row
    fireEvent.click(screen.getByText(/sarah jenkins/i));

    // LockedPreview renders an unlock CTA (may appear in multiple places)
    expect(screen.getByText(/unlock record/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1 credit/i).length).toBeGreaterThan(0);
  });
});

// ─── Dashboard ────────────────────────────────────────────────────────────────

const baseDashboardProps = {
  credits: 5,
  contributionCount: 12,
  unlockedCount: 3,
  lockedAttempts: 0,
  onNavigate: vi.fn(),
  onOptIn: vi.fn(),
  onOptOut: vi.fn(),
};

describe('Dashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the opt-in banner when the clinic is not opted in', () => {
    render(<Dashboard {...baseDashboardProps} isOptedIn={false} />);
    expect(screen.getByText(/network connection inactive/i)).toBeInTheDocument();
  });

  it('hides the opt-in banner when the clinic is opted in', () => {
    render(<Dashboard {...baseDashboardProps} isOptedIn={true} />);
    expect(screen.queryByText(/network connection inactive/i)).not.toBeInTheDocument();
  });

  it('renders the Credit Loop section when opted in', () => {
    render(<Dashboard {...baseDashboardProps} isOptedIn={true} />);
    expect(screen.getByText(/credit loop/i)).toBeInTheDocument();
    // The progress bars are rendered inside the credit loop section
    const creditLoopSection = screen.getByText(/credit loop/i).closest('div')!;
    expect(creditLoopSection).toBeInTheDocument();
  });

  it('shows the Network Intelligence panel with Network Signals', () => {
    render(<Dashboard {...baseDashboardProps} isOptedIn={true} />);
    expect(screen.getByText(/network intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/network signals/i)).toBeInTheDocument();
  });

  it('calls onOptIn when the Opt In to Network button is clicked', () => {
    const onOptIn = vi.fn();
    render(<Dashboard {...baseDashboardProps} isOptedIn={false} onOptIn={onOptIn} />);
    fireEvent.click(screen.getByRole('button', { name: /opt in to network/i }));
    expect(onOptIn).toHaveBeenCalledOnce();
  });

  it('displays the current credit balance', () => {
    render(<Dashboard {...baseDashboardProps} isOptedIn={true} credits={7} />);
    // The large credit counter in the credits card
    const matches = screen.getAllByText('7');
    expect(matches.length).toBeGreaterThan(0);
  });
});
