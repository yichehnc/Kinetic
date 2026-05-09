import { describe, it, expect } from 'vitest';
import {
  validateStep1,
  validateStep2,
  isStepValid,
  buildCompositeCondition,
  parseDraft,
  friendlyMessages,
} from '../lib/contributionValidation';

describe('validateStep1', () => {
  it('returns no errors when all required fields are filled', () => {
    const errs = validateStep1({
      patientId: '1234 56789 1',
      patientName: 'Jane Doe',
      dob: '1985-04-12',
    });
    expect(errs).toHaveLength(0);
  });

  it('flags missing patientId', () => {
    const errs = validateStep1({ patientId: '', patientName: 'Jane', dob: '1985-04-12' });
    expect(errs).toHaveLength(1);
    expect(errs[0].field).toBe('patientId');
    expect(errs[0].message).toBe(friendlyMessages.patientId);
  });

  it('flags whitespace-only patientId as missing', () => {
    const errs = validateStep1({ patientId: '   ', patientName: 'Jane', dob: '1985-04-12' });
    expect(errs.find(e => e.field === 'patientId')).toBeDefined();
  });

  it('flags whitespace-only patientName as missing', () => {
    const errs = validateStep1({ patientId: 'X', patientName: '   ', dob: '1985-04-12' });
    expect(errs.find(e => e.field === 'patientName')).toBeDefined();
  });

  it('flags missing dob', () => {
    const errs = validateStep1({ patientId: 'X', patientName: 'Jane', dob: '' });
    expect(errs.find(e => e.field === 'dob')).toBeDefined();
  });

  it('returns all 3 errors when nothing is filled in', () => {
    const errs = validateStep1({ patientId: '', patientName: '', dob: '' });
    expect(errs).toHaveLength(3);
    const fields = errs.map(e => e.field).sort();
    expect(fields).toEqual(['dob', 'patientId', 'patientName']);
  });

  it('uses the same friendly copy as the form for each field', () => {
    const errs = validateStep1({ patientId: '', patientName: '', dob: '' });
    const byField = Object.fromEntries(errs.map(e => [e.field, e.message]));
    expect(byField.patientId).toBe(friendlyMessages.patientId);
    expect(byField.patientName).toBe(friendlyMessages.patientName);
    expect(byField.dob).toBe(friendlyMessages.dob);
  });

  // BUG GUARD: undefined should not crash validation (treats it as missing)
  it('handles undefined fields without throwing', () => {
    const errs = validateStep1({
      patientId: undefined as any,
      patientName: undefined as any,
      dob: undefined as any,
    });
    expect(errs).toHaveLength(3);
  });
});

describe('validateStep2', () => {
  it('returns no errors when all classifications are picked', () => {
    const errs = validateStep2({
      bodyRegion: 'Knee',
      complaintType: 'Pain',
      rehabStage: 'Acute',
    });
    expect(errs).toHaveLength(0);
  });

  it('flags every missing classification independently', () => {
    const errs = validateStep2({ bodyRegion: '', complaintType: '', rehabStage: '' });
    expect(errs).toHaveLength(3);
  });

  it('flags only the missing field when others are picked', () => {
    const errs = validateStep2({
      bodyRegion: 'Knee',
      complaintType: '',
      rehabStage: 'Acute',
    });
    expect(errs).toHaveLength(1);
    expect(errs[0].field).toBe('complaintType');
  });
});

describe('isStepValid', () => {
  it('is true when error list is empty', () => {
    expect(isStepValid([])).toBe(true);
  });

  it('is false when there is any error', () => {
    expect(isStepValid([{ field: 'patientId', message: 'x' }])).toBe(false);
  });
});

describe('buildCompositeCondition', () => {
  it('joins region and complaint with " - "', () => {
    expect(buildCompositeCondition({ bodyRegion: 'Knee', complaintType: 'Pain' })).toBe('Knee - Pain');
  });

  // BUG GUARD: empty parts shouldn't produce nonsense like " - " or "Knee - "
  // — but we WILL produce that, which is a bug. This test documents current behaviour.
  it('produces " - " when both fields are empty (KNOWN: not guarded against)', () => {
    expect(buildCompositeCondition({ bodyRegion: '', complaintType: '' })).toBe(' - ');
  });
});

// Round-trip: prefilled mock data should pass step 1 + 2 validation cleanly.
// Guards against the AI demo payload drifting out of sync with field requirements.
describe('AI demo prefill round-trip', () => {
  const aiPrefill = {
    patientId: '6748 21503 1',
    patientName: 'Daniel Reyes',
    dob: '1989-07-22',
    bodyRegion: 'Lumbar Spine',
    complaintType: 'Pain',
    rehabStage: 'Sub-Acute',
  };

  it('passes step 1 validation', () => {
    expect(validateStep1(aiPrefill)).toHaveLength(0);
  });

  it('passes step 2 validation', () => {
    expect(validateStep2(aiPrefill)).toHaveLength(0);
  });

  it('produces a non-empty composite condition', () => {
    expect(buildCompositeCondition(aiPrefill)).toBe('Lumbar Spine - Pain');
  });
});

describe('parseDraft', () => {
  it('returns null for null input', () => {
    expect(parseDraft(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseDraft('')).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    expect(parseDraft('{not json')).toBeNull();
  });

  it('returns null for JSON arrays (wrong shape)', () => {
    expect(parseDraft('[1,2,3]')).toBeNull();
  });

  it('returns null for JSON primitives (wrong shape)', () => {
    expect(parseDraft('"hello"')).toBeNull();
    expect(parseDraft('42')).toBeNull();
    expect(parseDraft('null')).toBeNull();
    expect(parseDraft('true')).toBeNull();
  });

  it('returns parsed object for valid draft JSON', () => {
    const raw = JSON.stringify({ patientId: 'X', patientName: 'Jane', dob: '1985-04-12' });
    const result = parseDraft(raw);
    expect(result).not.toBeNull();
    expect(result?.patientId).toBe('X');
    expect(result?.patientName).toBe('Jane');
  });

  it('does not throw on adversarial input', () => {
    expect(() => parseDraft('{"a":' + 'x'.repeat(10) + '}')).not.toThrow();
    expect(() => parseDraft('}}')).not.toThrow();
    expect(() => parseDraft('undefined')).not.toThrow();
  });
});
