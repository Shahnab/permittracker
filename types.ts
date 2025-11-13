

export enum PermitStatus {
  Active = 'Active',
  ExpiresSoon = 'Expires Soon',
  Expired = 'Expired',
  InProcess = 'In Process',
}

export enum ApplicationStepStatus {
  Completed = 'Completed',
  InProgress = 'In Progress',
  Pending = 'Pending',
}

export enum DocumentCategory {
    Passport = 'Passport',
    Contract = 'Contract',
    Degree = 'Degree',
    HealthCheck = 'Health Check',
    Photo = 'Photo',
    OldPermit = 'Old Work Permit/TRC',
    Other = 'Other',
}

export enum RenewalStatus {
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected',
}

// New types for detailed process tracking
export enum ProcessStage {
    NotStarted = 'Not Started',
    DocCollection = 'Document Collection',
    VendorSubmission = 'Vendor Submission',
    GovtApproval = 'Government Approval',
    PermitIssued = 'Permit/TRC Issued',
    Complete = 'Process Complete',
}

export enum PhysicalDocumentStatus {
    NotRequested = 'Not Requested',
    Requested = 'Requested',
    Submitted = 'Submitted',
    Verified = 'Verified',
}

export interface PhysicalDocument {
    name: DocumentCategory;
    status: PhysicalDocumentStatus;
}

export interface ProcessStep {
    name: ProcessStage;
    status: ApplicationStepStatus;
    date: string;
}

export interface Process {
    currentStage: ProcessStage;
    steps: ProcessStep[];
    physicalDocuments: PhysicalDocument[];
}

export interface WorkPermit {
  id: string;
  permitNumber: string;
  issueDate: string;
  expiryDate: string;
  status: PermitStatus;
}

export interface Document {
    id: string;
    name: string;
    category: DocumentCategory;
    uploadDate: string;
    url: string;
}

export interface RenewalRecord {
    id: string;
    renewalApplicationDate: string;
    status: RenewalStatus;
    decisionDate: string;
}

export interface Expat {
  id: string;
  name: string;
  nationality: string;
  avatarUrl: string;
  jobTitle: string;
  department: string;
  currentPermit: WorkPermit;
  documents: Document[];
  renewalHistory: RenewalRecord[];
  // New process fields
  onboardingProcess?: Process;
  renewalProcess?: Process;
}

export type View = 'dashboard' | 'expats' | 'expatDetail' | 'reports' | 'settings';

export type NotificationChannel = 'inApp' | 'email';

export type ReminderInterval = '7days' | '14days' | '30days' | '60days';

export interface NotificationSettings {
    enabled: boolean;
    channels: NotificationChannel[];
    leadTime: 30 | 60 | 90;
    emailSettings?: {
        sendCalendarInvites: boolean;
        reminderIntervals: ReminderInterval[];
    };
}

export interface Notification {
    id: string;
    expatId: string;
    expatName: string;
    message: string;
    date: string;
}