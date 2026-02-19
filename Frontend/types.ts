
export enum RiskLevel {
  SAFE = 'SAFE',
  ADJUST_DOSAGE = 'ADJUST_DOSAGE',
  TOXIC = 'TOXIC'
}

export interface GeneProfile {
  gene: string;
  diplotype: string;
  phenotype: string;
  variants: string[];
}

export interface DrugAnalysis {
  drug: string;
  risk: RiskLevel;
  confidence: number;
  geneProfiles: GeneProfile[];
  recommendation: string;
  aiExplanation?: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarUrl?: string;
}

export interface AnalysisRecord {
  id: string;
  date: string;
  patientId: string;
  drugs: string[];
  status: 'Complete' | 'Pending';
}

export interface SystemSettings {
  guidelineSync: boolean;
  aiNarrativeDetail: 'Concise' | 'Standard' | 'Exhaustive';
  hipaaMode: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  time: string;
  read: boolean;
}
