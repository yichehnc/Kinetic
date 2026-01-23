import React, { useState } from 'react';
import { Lock, Unlock, Eye, AlertCircle, CheckCircle, Shield, Clock, FileText } from 'lucide-react';
import { HistoryEntry } from '../types';

// Mock snapshot data (replace with actual API calls)
const MOCK_SNAPSHOT = {
  snapshot_id: 'snap-001',
  patient_id: 'PT-2024-8812',
  consent_status: 'granted',
  last_updated_at: '2024-01-15T10:30:00Z',
  shared_scope: 'continuity_snapshot_v1',
  snapshot: {
    subjective: {
      primary_complaint: 'lower_back_pain',
      symptom_duration: 'greater_than_3_months',
      patient_goal: 'reduce_pain'
    },
    objective: {
      body_regions: ['lumbar_spine'],
      working_diagnosis_code: 'M54.5',
      rehab_stage: 'chronic',
      red_flags_present: false
    },
    assessment: {
      clinical_focus: ['load_management', 'motor_control', 'strength'],
      functional_limitations: ['sitting', 'lifting']
    },
    plan: {
      treatment_categories: ['strengthening', 'education', 'manual_therapy'],
      home_exercise_program: true,
      referral_made: false
    }
  }
};

// Enum label mappings for display
const LABELS: any = {
  primary_complaint: {
    knee_pain: 'Knee Pain',
    shoulder_pain: 'Shoulder Pain',
    lower_back_pain: 'Lower Back Pain',
    post_surgical_rehab: 'Post-Surgical Rehab',
    sports_injury: 'Sports Injury',
    other: 'Other'
  },
  symptom_duration: {
    less_than_2_weeks: '< 2 weeks',
    '2_to_6_weeks': '2-6 weeks',
    '6_weeks_to_3_months': '6 weeks - 3 months',
    greater_than_3_months: '> 3 months'
  },
  patient_goal: {
    return_to_sport: 'Return to Sport',
    reduce_pain: 'Reduce Pain',
    improve_mobility: 'Improve Mobility',
    daily_function: 'Daily Function'
  },
  body_regions: {
    knee: 'Knee',
    shoulder: 'Shoulder',
    hip: 'Hip',
    ankle: 'Ankle',
    lumbar_spine: 'Lumbar Spine',
    cervical_spine: 'Cervical Spine'
  },
  rehab_stage: {
    acute: 'Acute',
    subacute: 'Subacute',
    chronic: 'Chronic',
    return_to_activity: 'Return to Activity',
    'Resolved': 'Resolved',
    'Ongoing': 'Ongoing',
    'Plateaued': 'Plateaued'
  },
  clinical_focus: {
    load_management: 'Load Management',
    motor_control: 'Motor Control',
    mobility: 'Mobility',
    strength: 'Strength',
    pain_modulation: 'Pain Modulation'
  },
  functional_limitations: {
    walking: 'Walking',
    running: 'Running',
    lifting: 'Lifting',
    overhead_activity: 'Overhead Activity',
    sitting: 'Sitting'
  },
  treatment_categories: {
    strengthening: 'Strengthening',
    manual_therapy: 'Manual Therapy',
    neuromuscular_control: 'Neuromuscular Control',
    education: 'Education',
    conditioning: 'Conditioning'
  }
};

interface SnapshotCardProps {
  patientId: string;
  isUnlocked: boolean;
  credits: number;
  onUnlock: () => void;
  historyEntry?: HistoryEntry;
}

export const ClinicalSnapshotCard: React.FC<SnapshotCardProps> = ({ 
  patientId, 
  isUnlocked, 
  credits, 
  onUnlock,
  historyEntry
}) => {
  const [showDetails, setShowDetails] = useState(true);

  // Helper to get label or fallback to raw string
  const getLabel = (category: string, key: string) => {
    if (LABELS[category] && LABELS[category][key]) {
        return LABELS[category][key];
    }
    // Attempt to format snake_case to Title Case if not found
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const primaryComplaint = historyEntry?.condition || LABELS.primary_complaint[MOCK_SNAPSHOT.snapshot.subjective.primary_complaint];
  const rehabStage = historyEntry?.status || LABELS.rehab_stage[MOCK_SNAPSHOT.snapshot.objective.rehab_stage];
  
  // Use historyEntry successful treatments if available, otherwise mock
  const treatmentCategories = historyEntry?.successfulTreatments && historyEntry.successfulTreatments.length > 0
    ? historyEntry.successfulTreatments 
    : MOCK_SNAPSHOT.snapshot.plan.treatment_categories.map(c => LABELS.treatment_categories[c]);

  if (!isUnlocked) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
        
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Clinical Snapshot Available</h3>
                <p className="text-sm text-slate-500">Continuity of Care Summary</p>
              </div>
            </div>
            <Lock className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
              <span>Patient consent: <strong>Granted</strong></span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <FileText className="w-4 h-4 mr-2 text-blue-500" />
              <span>Structured SOAP note summary</span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <Clock className="w-4 h-4 mr-2 text-amber-500" />
              <span>Last updated: {historyEntry ? new Date(historyEntry.createdAt).toLocaleDateString() : 'Jan 15, 2024'}</span>
            </div>
          </div>

          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-lg mb-4">
            <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
              What's Included
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div>✓ Primary complaint</div>
              <div>✓ Rehab stage</div>
              <div>✓ Clinical focus areas</div>
              <div>✓ Treatment approach</div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
              <strong>Not included:</strong> Clinician notes, session details, or identifying information
            </div>
          </div>

          <button
            onClick={onUnlock}
            disabled={credits < 1}
            className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              credits >= 1
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200/50'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Unlock className="w-5 h-5" />
            <span>Unlock Snapshot</span>
            <span className="px-2 py-0.5 bg-white/20 rounded text-sm">1 Point</span>
          </button>
          
          {credits < 1 && (
            <p className="text-xs text-center text-red-600 mt-2">
              Insufficient credits. Contribute patient data to earn points.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">Clinical Snapshot</h3>
              <p className="text-xs text-emerald-50">Unlocked • Read-Only</p>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 bg-white/20 rounded-lg text-xs font-medium hover:bg-white/30 transition-colors"
          >
            {showDetails ? 'Hide' : 'View'} Details
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="p-6 space-y-6">
          {/* Subjective */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-blue-600">S</span>
              </div>
              Subjective
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Primary Complaint:</span>
                <p className="font-semibold text-slate-900">
                  {primaryComplaint}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Duration:</span>
                <p className="font-semibold text-slate-900">
                  {historyEntry?.timelineStart ? `Since ${historyEntry.timelineStart}` : LABELS.symptom_duration[MOCK_SNAPSHOT.snapshot.subjective.symptom_duration]}
                </p>
              </div>
              {MOCK_SNAPSHOT.snapshot.subjective.patient_goal && (
                <div className="col-span-2">
                  <span className="text-slate-500">Patient Goal:</span>
                  <p className="font-semibold text-slate-900">
                    {LABELS.patient_goal[MOCK_SNAPSHOT.snapshot.subjective.patient_goal]}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Objective */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
              <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-purple-600">O</span>
              </div>
              Objective
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500">Body Regions:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {MOCK_SNAPSHOT.snapshot.objective.body_regions.map(region => (
                    <span key={region} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {getLabel('body_regions', region)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Diagnosis Code:</span>
                <p className="font-mono font-semibold text-slate-900">
                  {MOCK_SNAPSHOT.snapshot.objective.working_diagnosis_code}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500">Rehab Stage:</span>
                  <p className="font-semibold text-slate-900">
                    {rehabStage}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Red Flags:</span>
                  <p className={`font-semibold ${MOCK_SNAPSHOT.snapshot.objective.red_flags_present ? 'text-red-600' : 'text-emerald-600'}`}>
                    {MOCK_SNAPSHOT.snapshot.objective.red_flags_present ? 'Present' : 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
              <div className="w-6 h-6 bg-amber-100 rounded flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-amber-600">A</span>
              </div>
              Assessment
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500">Clinical Focus:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {MOCK_SNAPSHOT.snapshot.assessment.clinical_focus.map(focus => (
                    <span key={focus} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                      {getLabel('clinical_focus', focus)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Functional Limitations:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {MOCK_SNAPSHOT.snapshot.assessment.functional_limitations.map(limit => (
                    <span key={limit} className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">
                      {getLabel('functional_limitations', limit)}
                    </span>
                  ))}
                </div>
              </div>
              {/* Added Contraindications from HistoryEntry if present */}
              {historyEntry && historyEntry.contraindications.length > 0 && (
                <div>
                  <span className="text-slate-500">Contraindications:</span>
                   <div className="flex flex-wrap gap-2 mt-1">
                     {historyEntry.contraindications.map(c => (
                       <span key={c} className="flex items-center px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-medium">
                         <AlertCircle className="w-3 h-3 mr-1" /> {c}
                       </span>
                     ))}
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Plan */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
              <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-emerald-600">P</span>
              </div>
              Plan
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500">Treatment Categories:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {treatmentCategories.map(cat => (
                    <span key={cat} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center">
                  {MOCK_SNAPSHOT.snapshot.plan.home_exercise_program ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-300 mr-2" />
                  )}
                  <span className={MOCK_SNAPSHOT.snapshot.plan.home_exercise_program ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                    Home Exercise Program
                  </span>
                </div>
                <div className="flex items-center">
                  {MOCK_SNAPSHOT.snapshot.plan.referral_made ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-300 mr-2" />
                  )}
                  <span className={MOCK_SNAPSHOT.snapshot.plan.referral_made ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                    Referral Made
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Version: continuity_snapshot_v1</span>
              <span>Updated: {historyEntry ? new Date(historyEntry.createdAt).toLocaleDateString() : new Date(MOCK_SNAPSHOT.last_updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};