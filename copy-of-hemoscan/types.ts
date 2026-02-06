
export enum AnemiaType {
  NORMAL = 'Normal',
  IRON_DEFICIENCY = 'Iron Deficiency Anemia',
  VITAMIN_DEFICIENCY = 'Vitamin B12/Folate Deficiency',
  APLASTIC = 'Aplastic Anemia',
  HEMOLYTIC = 'Hemolytic Anemia',
  CHRONIC_DISEASE = 'Anemia of Chronic Disease'
}

export enum RiskLevel {
  LOW = 'Low',
  MODERATE = 'Moderate',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  hemoglobin: number;
  mcv: number;
  mch: number;
  mchc: number;
  date: string;
}

export interface ScreeningResult {
  classification: AnemiaType;
  confidenceScore: number;
  riskLevel: RiskLevel;
  analysisSummary: string;
}

export interface HistoricalData {
  date: string;
  hemoglobin: number;
  mcv: number;
}
