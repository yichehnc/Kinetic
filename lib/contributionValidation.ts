// Pure validation logic for the Contribute Evidence form.
// Kept separate from the component so it's easy to test and reuse.

export type FieldError = { field: string; message: string };

export interface ContributionFormData {
  patientId: string;
  patientName: string;
  dob: string;
  start?: string;
  end?: string;
  bodyRegion: string;
  complaintType: string;
  rehabStage: string;
  status?: string;
  successful?: string[];
  unsuccessful?: string[];
  contraindications?: string[];
}

export const friendlyMessages: Record<string, string> = {
  patientId: "Add a Patient ID (Medicare number) so records can link across clinics.",
  patientName: "We need the patient's full name to create the record.",
  dob: "Date of birth is required — it helps anonymise without losing demographic context.",
  bodyRegion: "Pick the body region this contribution covers.",
  complaintType: "Choose the complaint type so other clinicians can find this case.",
  rehabStage: "Select the rehab stage at the time of contribution.",
};

export function validateStep1(formData: Pick<ContributionFormData, 'patientId' | 'patientName' | 'dob'>): FieldError[] {
  const errs: FieldError[] = [];
  if (!formData.patientId || !formData.patientId.trim()) {
    errs.push({ field: 'patientId', message: friendlyMessages.patientId });
  }
  if (!formData.patientName || !formData.patientName.trim()) {
    errs.push({ field: 'patientName', message: friendlyMessages.patientName });
  }
  if (!formData.dob) {
    errs.push({ field: 'dob', message: friendlyMessages.dob });
  }
  return errs;
}

export function validateStep2(
  formData: Pick<ContributionFormData, 'bodyRegion' | 'complaintType' | 'rehabStage'>
): FieldError[] {
  const errs: FieldError[] = [];
  if (!formData.bodyRegion) errs.push({ field: 'bodyRegion', message: friendlyMessages.bodyRegion });
  if (!formData.complaintType) errs.push({ field: 'complaintType', message: friendlyMessages.complaintType });
  if (!formData.rehabStage) errs.push({ field: 'rehabStage', message: friendlyMessages.rehabStage });
  return errs;
}

export function isStepValid(errors: FieldError[]): boolean {
  return errors.length === 0;
}

export function buildCompositeCondition(
  formData: Pick<ContributionFormData, 'bodyRegion' | 'complaintType'>
): string {
  return `${formData.bodyRegion} - ${formData.complaintType}`;
}

/**
 * Safely parse a saved draft. Returns the parsed object or null if invalid.
 * Never throws — callers can rely on the null return for corrupt-data paths.
 */
export function parseDraft(rawJson: string | null): ContributionFormData | null {
  if (!rawJson) return null;
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed as ContributionFormData;
  } catch {
    return null;
  }
}
