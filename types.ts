export enum Status {
  RESOLVED = 'Resolved',
  ONGOING = 'Ongoing',
  PLATEAUED = 'Plateaued'
}

export enum TreatmentType {
  MANUAL_THERAPY = 'Manual Therapy',
  DRY_NEEDLING = 'Dry Needling',
  EXERCISE_REHAB = 'Exercise Rehab',
  ULTRASOUND = 'Ultrasound',
  TAPING = 'Taping',
  MANIPULATION = 'Manipulation'
}

export interface Patient {
  id: string;
  name: string; // In real app, this might be obscured until consent
  dob: string;
  lastVisit: string;
  historyAvailable: boolean;
}

export interface HistoryEntry {
  id: string;
  patientId: string;
  condition: string; // e.g., "ACL Tear"
  timelineStart: string;
  timelineEnd?: string;
  status: Status;
  successfulTreatments: TreatmentType[];
  unsuccessfulTreatments: TreatmentType[];
  contraindications: string[]; // Structured tags, not free text
  createdAt: string;
  // Metadata
  sourceClinicHash: string; // Anonymized
}

export interface ClinicState {
  name: string;
  credits: number;
  optedIn: boolean;
  unlockedPatients: string[]; // List of patient IDs where history is unlocked
  contributionCount: number;
}