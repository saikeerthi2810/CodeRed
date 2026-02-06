
import { AnemiaType, RiskLevel, PatientRecord, ScreeningResult } from './types';

export const CLINICAL_RANGES = {
  HEMOGLOBIN: { M: [13.5, 17.5], F: [12.0, 15.5], unit: 'g/dL', step: 0.1, min: 5, max: 20 },
  MCV: { range: [80, 100], unit: 'fL', step: 1, min: 50, max: 120 },
  MCH: { range: [27, 33], unit: 'pg', step: 1, min: 15, max: 45 },
  MCHC: { range: [32, 36], unit: 'g/dL', step: 0.1, min: 20, max: 40 }
};

export const MOCK_HISTORICAL_DATA = [
  { date: 'Oct 23', hemoglobin: 10.2, mcv: 72, score: 45 },
  { date: 'Nov 23', hemoglobin: 10.8, mcv: 75, score: 55 },
  { date: 'Jan 24', hemoglobin: 11.5, mcv: 78, score: 68 },
  { date: 'Feb 24', hemoglobin: 11.2, mcv: 77, score: 65 },
];

export interface FullPatientEntry {
  record: PatientRecord;
  result: ScreeningResult;
}

export const MOCK_PATIENTS: FullPatientEntry[] = [
  {
    record: { id: 'p1', name: 'Alex Johnson', age: 34, gender: 'M', hemoglobin: 11.8, mcv: 78, mch: 25, mchc: 31, date: '2024-03-20T10:00:00Z' },
    result: { classification: AnemiaType.IRON_DEFICIENCY, confidenceScore: 0.88, riskLevel: RiskLevel.MODERATE, analysisSummary: "Patient is showing steady improvement from previous low levels. Iron supplementation is effective." }
  },
  {
    record: { id: 'p2', name: 'Alex Johnson', age: 34, gender: 'M', hemoglobin: 10.1, mcv: 72, mch: 23, mchc: 29, date: '2024-02-15T09:30:00Z' },
    result: { classification: AnemiaType.IRON_DEFICIENCY, confidenceScore: 0.94, riskLevel: RiskLevel.HIGH, analysisSummary: "Acute drop in hemoglobin. Dosage of oral iron may need adjustment based on absorption issues." }
  },
  {
    record: { id: 'p3', name: 'Alex Johnson', age: 34, gender: 'M', hemoglobin: 13.6, mcv: 85, mch: 29, mchc: 33, date: '2023-12-05T14:15:00Z' },
    result: { classification: AnemiaType.NORMAL, confidenceScore: 0.91, riskLevel: RiskLevel.LOW, analysisSummary: "Baseline healthy state. No clinical intervention was required at this stage." }
  }
];

export const COLORS = {
  teal: '#00a3ad',
  emerald: '#10b981',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  rose: '#f43f5e',
  amber: '#f59e0b',
  slate: '#64748b',
  cyan: '#06b6d4',
  orange: '#f97316'
};
