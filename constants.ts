import { Patient, HistoryEntry, Status, TreatmentType } from './types';

export const MOCK_PATIENTS: Patient[] = [
  { id: 'P001', name: 'Sarah Jenkins', dob: '1985-04-12', lastVisit: '2023-10-15', historyAvailable: true },
  { id: 'P002', name: 'Michael Chen', dob: '1990-08-22', lastVisit: '2024-01-10', historyAvailable: true },
  { id: 'P003', name: 'David Smith', dob: '1978-11-03', lastVisit: '2024-02-01', historyAvailable: false }, // New patient, no history
  { id: 'P004', name: 'Emma Wilson', dob: '1995-02-14', lastVisit: '2023-12-05', historyAvailable: true },
];

export const MOCK_HISTORY: HistoryEntry[] = [
  {
    id: 'H001',
    patientId: 'P001',
    condition: 'Chronic Lower Back Pain',
    timelineStart: '2023-01-10',
    timelineEnd: '2023-06-15',
    status: Status.RESOLVED,
    successfulTreatments: [TreatmentType.EXERCISE_REHAB, TreatmentType.MANUAL_THERAPY],
    unsuccessfulTreatments: [TreatmentType.ULTRASOUND, TreatmentType.TAPING],
    contraindications: ['High-velocity manipulation', 'NSAIDS'],
    createdAt: '2023-06-20',
    sourceClinicHash: 'CLINIC_XYZ_HASH'
  },
  {
    id: 'H002',
    patientId: 'P002',
    condition: 'Rotator Cuff Tendinopathy',
    timelineStart: '2023-11-01',
    status: Status.ONGOING,
    successfulTreatments: [TreatmentType.DRY_NEEDLING],
    unsuccessfulTreatments: [TreatmentType.EXERCISE_REHAB],
    contraindications: ['Overhead loading'],
    createdAt: '2024-01-15',
    sourceClinicHash: 'CLINIC_ABC_HASH'
  }
];

export const TREATMENTS_LIST = Object.values(TreatmentType);

export const CONTRAINDICATIONS_LIST = [
  'High-velocity manipulation',
  'NSAIDS',
  'Ice/Cold Therapy',
  'Heat Therapy',
  'Electrical Stimulation',
  'Specific Loading',
  'Cervical Traction'
];