import { Patient, HistoryEntry, Status, TreatmentType, Appointment } from './types';

export const MOCK_PATIENTS: Patient[] = [
  { id: '3482 91024 1', name: 'Sarah Jenkins', dob: '1985-04-12', lastVisit: '2023-10-15', historyAvailable: true },
  { id: '8291 03845 2', name: 'Michael Chen', dob: '1990-08-22', lastVisit: '2024-01-10', historyAvailable: true },
  { id: '1092 58172 1', name: 'David Smith', dob: '1978-11-03', lastVisit: '2024-02-01', historyAvailable: false },
  { id: '5521 90124 3', name: 'Emma Wilson', dob: '1995-02-14', lastVisit: '2023-12-05', historyAvailable: true },
  { id: '2938 10045 1', name: 'Thomas Mueller', dob: '1982-06-30', lastVisit: '2024-03-20', historyAvailable: true },
  { id: '2291 88471 1', name: 'Sophie Laurent', dob: '1992-12-05', lastVisit: '2024-04-15', historyAvailable: true },
  { id: '9102 38475 2', name: 'James Anderson', dob: '1975-09-18', lastVisit: '2024-02-28', historyAvailable: false },
  { id: '4432 10985 1', name: 'Olivia Taylor', dob: '1988-11-20', lastVisit: '2024-05-02', historyAvailable: true },
  { id: '7721 03948 2', name: 'Lucas Rossi', dob: '1993-03-14', lastVisit: '2024-04-22', historyAvailable: true },
  { id: '1182 93041 3', name: 'Isabella Garcia', dob: '1980-07-09', lastVisit: '2024-05-10', historyAvailable: false },
];

export const MOCK_HISTORY: HistoryEntry[] = [
  {
    id: 'H001',
    patientId: '3482 91024 1',
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
    patientId: '8291 03845 2',
    condition: 'Rotator Cuff Tendinopathy',
    timelineStart: '2023-11-01',
    status: Status.ONGOING,
    successfulTreatments: [TreatmentType.DRY_NEEDLING],
    unsuccessfulTreatments: [TreatmentType.EXERCISE_REHAB],
    contraindications: ['Overhead loading'],
    createdAt: '2024-01-15',
    sourceClinicHash: 'CLINIC_ABC_HASH'
  },
  {
    id: 'H004',
    patientId: '5521 90124 3',
    condition: 'Lateral Ankle Sprain (Grade II)',
    timelineStart: '2023-12-05',
    status: Status.PLATEAUED,
    successfulTreatments: [TreatmentType.TAPING, TreatmentType.EXERCISE_REHAB],
    unsuccessfulTreatments: [TreatmentType.MANUAL_THERAPY],
    contraindications: ['High impact loading'],
    createdAt: '2024-02-01',
    sourceClinicHash: 'CLINIC_LMN_HASH'
  }
];

export const MOCK_SCHEDULE: Appointment[] = [
  { id: 'APT01', time: '09:00 AM', patientId: '3482 91024 1', reason: 'LBP Maintenance', status: 'Completed' },
  { id: 'APT02', time: '10:00 AM', patientId: '8291 03845 2', reason: 'Shoulder Assessment', status: 'Arrived' },
  { id: 'APT03', time: '11:30 AM', patientId: '5521 90124 3', reason: 'Ankle Rehab', status: 'Scheduled' },
  { id: 'APT04', time: '01:00 PM', patientId: '1092 58172 1', reason: 'Initial Consult', status: 'Scheduled' },
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

// Minimal valid PDF base64 for demo purposes (A blank page with "Kinetic Demo Report" text)
export const DEMO_PDF_BASE64 = "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXwKICAvTWVkaWFCb3ggWyAwIDAgNTk1LjI4IDg0MS44OSBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCisgICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iagoKNSAwIG9iago8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooS2luZXRpYyBEZW1vIFJlcG9ydCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAKMDAwMDAwMDE1NyAwMDAwMCBuIAowMDAwMDAwMzA2IDAwMDAwIG4gCjAwMDAwMDAzOTIgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9GCg==";