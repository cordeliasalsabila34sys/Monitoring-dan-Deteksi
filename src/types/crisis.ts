export type NavPage =
  | 'dashboard'
  | 'monitoring'
  | 'sentiment'
  | 'validation'
  | 'classification'
  | 'response'
  | 'distribution'
  | 'evaluation'
  | 'history'
  | 'reports'
  | 'settings';

export type UserRole = 'Administrator' | 'Tim Humas';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  unit: string;
  passwordHash: string;
  active: boolean;
  createdAt: string;
}

export type SourceChannel =
  | 'Instagram'
  | 'Twitter/X'
  | 'TikTok'
  | 'Website'
  | 'Email'
  | 'Acara/Kegiatan';

export type SentimentType = 'Positif' | 'Netral' | 'Negatif';

export type EarlyWarningLevel = 'aman' | 'meningkat' | 'serius' | 'krisis';

export type CrisisLevel = 'Belum Diklasifikasi' | 'Krisis Tinggi' | 'Penanganan Terbatas';

export type ApprovalStatus =
  | 'Draf'
  | 'Menunggu Persetujuan'
  | 'Disetujui'
  | 'Ditolak'
  | 'Dipublikasikan';

export type RecoveryStatus =
  | 'Dalam Pemantauan'
  | 'Proses Pemulihan'
  | 'Krisis Teratasi';

export type DistributionPlatform =
  | 'Instagram'
  | 'Twitter/X'
  | 'TikTok'
  | 'Website Resmi';

export interface EvidenceItem {
  id: string;
  type: 'Tautan' | 'Teks Percakapan' | 'Screenshot' | 'Dokumen Pendukung';
  sourceAccount: string;
  timestampLabel: string;
  content: string;
  urlOrFile?: string;
  isSimulated: boolean;
  addedBy: string;
  addedAt: string;
}

export interface MonitoringMention {
  id: string;
  issueId: string;
  channel: SourceChannel;
  accountOrSource: string;
  content: string;
  foundAt: string;
  keyword: string;
  interactions: number;
  sentiment: SentimentType;
  verified: boolean;
  isSimulated: boolean;
}

export interface ValidationChecklist {
  sourceConfirmed: boolean;
  widespreadImpact: boolean;
  negativeSentimentRising: boolean;
  notes: string;
  validatedBy?: string;
  validatedAt?: string;
}

export interface ClassificationDecision {
  level: CrisisLevel;
  crisisTeamActive: boolean;
  schedulePaused: boolean;
  customerServiceRouted: boolean;
  limitedClarification: boolean;
  decidedBy?: string;
  decidedAt?: string;
  rationale?: string;
}

export interface OfficialMessage {
  draft: string;
  charLimit: number;
  status: ApprovalStatus;
  submittedBy?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  updatedAt?: string;
}

export interface DistributionRecord {
  id: string;
  platforms: DistributionPlatform[];
  publishedAt: string;
  publishedBy: string;
  mode: 'Simulasi Distribusi';
  messageSnapshot: string;
}

export interface EvaluationData {
  beforeMentions: number;
  afterMentions: number;
  beforeNegativePct: number;
  afterNegativePct: number;
  beforePositivePct: number;
  afterPositivePct: number;
  issueTrajectory: string;
  publicResponseSummary: string;
  messageEffectiveness: string;
  summaryNote: string;
  recoveryStatus: RecoveryStatus;
  evaluatedBy?: string;
  evaluatedAt?: string;
}

export interface ActivityLogEntry {
  id: string;
  issueId: string;
  issueTitle: string;
  action: string;
  detail: string;
  actor: string;
  role: UserRole;
  timestamp: string;
}

export interface CrisisIssue {
  id: string;
  title: string;
  description: string;
  primarySource: string;
  primaryChannel: SourceChannel;
  mentions: number;
  negativePct: number;
  neutralPct: number;
  positivePct: number;
  discoveredAt: string;
  lastUpdated: string;
  keywords: string[];
  earlyWarning: EarlyWarningLevel;
  isSimulated: boolean;
  evidence: EvidenceItem[];
  validation: ValidationChecklist;
  classification: ClassificationDecision;
  officialMessage: OfficialMessage;
  distributions: DistributionRecord[];
  evaluation: EvaluationData;
}

export interface TrendPoint {
  label: string;
  date: string;
  emailPositif: number;
  emailNetral: number;
  emailNegatif: number;
  medsosPositif: number;
  medsosNetral: number;
  medsosNegatif: number;
  acaraPositif: number;
  acaraNetral: number;
  acaraNegatif: number;
}

export interface SystemSettings {
  organizationName: string;
  defaultCharLimit: number;
  showSimulationBanner: boolean;
  autoEarlyWarningThresholdPct: number;
}
