

import { Expat, PermitStatus, ApplicationStepStatus, DocumentCategory, RenewalStatus, Process, ProcessStage, PhysicalDocumentStatus, ProcessStep, PhysicalDocument } from './types';
// FIX: Reverted to deep imports for date-fns functions to resolve module export errors.
// The barrel file (`'date-fns'`) does not seem to export members correctly in this environment.
import subMonths from 'date-fns/subMonths';
import addMonths from 'date-fns/addMonths';
import format from 'date-fns/format';
import subDays from 'date-fns/subDays';
import addDays from 'date-fns/addDays';
import subYears from 'date-fns/subYears';

const today = new Date();

// --- Process Templates ---

const ONBOARDING_DOCS: PhysicalDocument[] = [
    { name: DocumentCategory.Passport, status: PhysicalDocumentStatus.NotRequested },
    { name: DocumentCategory.Contract, status: PhysicalDocumentStatus.NotRequested },
    { name: DocumentCategory.Degree, status: PhysicalDocumentStatus.NotRequested },
    { name: DocumentCategory.HealthCheck, status: PhysicalDocumentStatus.NotRequested },
    { name: DocumentCategory.Photo, status: PhysicalDocumentStatus.NotRequested },
];

const RENEWAL_DOCS: PhysicalDocument[] = [
    ...ONBOARDING_DOCS,
    { name: DocumentCategory.OldPermit, status: PhysicalDocumentStatus.NotRequested },
];

const PROCESS_STEPS_TEMPLATE: ProcessStep[] = [
    { name: ProcessStage.DocCollection, status: ApplicationStepStatus.Pending, date: '' },
    { name: ProcessStage.VendorSubmission, status: ApplicationStepStatus.Pending, date: '' },
    { name: ProcessStage.GovtApproval, status: ApplicationStepStatus.Pending, date: '' },
    { name: ProcessStage.PermitIssued, status: ApplicationStepStatus.Pending, date: '' },
];

export const ONBOARDING_PROCESS_TEMPLATE: Process = {
    currentStage: ProcessStage.DocCollection,
    steps: PROCESS_STEPS_TEMPLATE.map(step => ({...step})),
    physicalDocuments: ONBOARDING_DOCS,
};

export const RENEWAL_PROCESS_TEMPLATE: Process = {
    currentStage: ProcessStage.DocCollection,
    steps: PROCESS_STEPS_TEMPLATE.map(step => ({...step})),
    physicalDocuments: RENEWAL_DOCS,
};


// --- EXPATS DATA ---

export const EXPATS_DATA: Expat[] = [
  {
    id: '1',
    name: 'Kenji Tanaka',
    nationality: 'Japan',
    avatarUrl: 'https://i.pravatar.cc/150?u=kenji_tanaka',
    jobTitle: 'Lead Software Engineer',
    department: 'Technology',
    currentPermit: {
      id: 'wp-101',
      permitNumber: 'VN-WP-84321',
      issueDate: format(subMonths(today, 22), 'yyyy-MM-dd'),
      expiryDate: format(addMonths(today, 2), 'yyyy-MM-dd'), // Expires soon
      status: PermitStatus.ExpiresSoon,
    },
    documents: [
        { id: 'doc-101', name: 'Passport_Tanaka.pdf', category: DocumentCategory.Passport, uploadDate: format(subMonths(today, 1), 'yyyy-MM-dd'), url: '#' },
        { id: 'doc-102', name: 'Contract_Tanaka.pdf', category: DocumentCategory.Contract, uploadDate: format(subMonths(today, 1), 'yyyy-MM-dd'), url: '#' },
    ],
    renewalHistory: [],
    // No renewalProcess started yet.
  },
  {
    id: '2',
    name: 'Maria Santos',
    nationality: 'Philippines',
    avatarUrl: 'https://i.pravatar.cc/150?u=maria_santos',
    jobTitle: 'Marketing Director',
    department: 'Marketing',
    currentPermit: {
      id: 'wp-102',
      permitNumber: 'VN-WP-84322',
      issueDate: format(subMonths(today, 12), 'yyyy-MM-dd'),
      expiryDate: format(addMonths(today, 12), 'yyyy-MM-dd'), // Active
      status: PermitStatus.Active,
    },
    documents: [
        { id: 'doc-201', name: 'Santos_Passport.pdf', category: DocumentCategory.Passport, uploadDate: format(subMonths(today, 13), 'yyyy-MM-dd'), url: '#' },
    ],
    renewalHistory: [
        { id: 'ren-hist-1', renewalApplicationDate: format(subMonths(today, 13), 'yyyy-MM-dd'), status: RenewalStatus.Approved, decisionDate: format(subMonths(today, 12), 'yyyy-MM-dd') }
    ],
  },
  {
    id: '3',
    name: 'Aarav Sharma',
    nationality: 'India',
    avatarUrl: 'https://i.pravatar.cc/150?u=aarav_sharma',
    jobTitle: 'Data Scientist',
    department: 'Analytics',
    currentPermit: {
      id: 'wp-103',
      permitNumber: 'VN-WP-84323',
      issueDate: format(subMonths(today, 25), 'yyyy-MM-dd'),
      expiryDate: format(subMonths(today, 1), 'yyyy-MM-dd'), // Expired
      status: PermitStatus.Expired,
    },
    renewalProcess: {
        currentStage: ProcessStage.DocCollection,
        steps: [
            { name: ProcessStage.DocCollection, status: ApplicationStepStatus.InProgress, date: format(subDays(today, 20), 'yyyy-MM-dd') },
            { name: ProcessStage.VendorSubmission, status: ApplicationStepStatus.Pending, date: '' },
            { name: ProcessStage.GovtApproval, status: ApplicationStepStatus.Pending, date: '' },
            { name: ProcessStage.PermitIssued, status: ApplicationStepStatus.Pending, date: '' },
        ],
        physicalDocuments: [
            { name: DocumentCategory.Passport, status: PhysicalDocumentStatus.Verified },
            { name: DocumentCategory.Contract, status: PhysicalDocumentStatus.Submitted },
            { name: DocumentCategory.Degree, status: PhysicalDocumentStatus.Requested },
            { name: DocumentCategory.HealthCheck, status: PhysicalDocumentStatus.Requested },
            { name: DocumentCategory.Photo, status: PhysicalDocumentStatus.NotRequested },
            { name: DocumentCategory.OldPermit, status: PhysicalDocumentStatus.NotRequested },
        ]
    },
    documents: [
        { id: 'doc-301', name: 'Passport_Sharma_old.pdf', category: DocumentCategory.Passport, uploadDate: format(subMonths(today, 26), 'yyyy-MM-dd'), url: '#' }
    ],
    renewalHistory: [
      { id: 'ren-hist-2', renewalApplicationDate: format(subMonths(today, 3), 'yyyy-MM-dd'), status: RenewalStatus.Rejected, decisionDate: format(subMonths(today, 2), 'yyyy-MM-dd') }
    ],
  },
  {
    id: '4',
    name: 'Emily Chan',
    nationality: 'Hong Kong',
    avatarUrl: 'https://i.pravatar.cc/150?u=emily_chan',
    jobTitle: 'UX/UI Designer',
    department: 'Product',
    currentPermit: {
      id: 'wp-104',
      permitNumber: 'VN-WP-84324',
      issueDate: format(subMonths(today, 2), 'yyyy-MM-dd'),
      expiryDate: format(addMonths(today, 22), 'yyyy-MM-dd'), // Active
      status: PermitStatus.Active,
    },
    documents: [
        { id: 'doc-401', name: 'Chan_Degree.pdf', category: DocumentCategory.Degree, uploadDate: format(subMonths(today, 2), 'yyyy-MM-dd'), url: '#' },
        { id: 'doc-402', name: 'Chan_HealthCert.pdf', category: DocumentCategory.HealthCheck, uploadDate: format(subMonths(today, 2), 'yyyy-MM-dd'), url: '#' },
    ],
    renewalHistory: [],
  },
  {
    id: '5',
    name: 'David Miller',
    nationality: 'Canada',
    avatarUrl: 'https://i.pravatar.cc/150?u=david_miller',
    jobTitle: 'Project Manager',
    department: 'Operations',
    currentPermit: {
      id: 'wp-105',
      permitNumber: 'N/A',
      issueDate: 'N/A',
      expiryDate: 'N/A',
      status: PermitStatus.InProcess,
    },
    onboardingProcess: {
        currentStage: ProcessStage.GovtApproval,
        steps: [
            { name: ProcessStage.DocCollection, status: ApplicationStepStatus.Completed, date: format(subMonths(today, 2), 'yyyy-MM-dd') },
            { name: ProcessStage.VendorSubmission, status: ApplicationStepStatus.Completed, date: format(subMonths(today, 1), 'yyyy-MM-dd') },
            { name: ProcessStage.GovtApproval, status: ApplicationStepStatus.InProgress, date: format(today, 'yyyy-MM-dd') },
            { name: ProcessStage.PermitIssued, status: ApplicationStepStatus.Pending, date: '' },
        ],
        physicalDocuments: [
             { name: DocumentCategory.Passport, status: PhysicalDocumentStatus.Verified },
            { name: DocumentCategory.Contract, status: PhysicalDocumentStatus.Verified },
            { name: DocumentCategory.Degree, status: PhysicalDocumentStatus.Verified },
            { name: DocumentCategory.HealthCheck, status: PhysicalDocumentStatus.Submitted },
            { name: DocumentCategory.Photo, status: PhysicalDocumentStatus.Submitted },
        ]
    },
    documents: [
        { id: 'doc-501', name: 'Miller_D_Passport.pdf', category: DocumentCategory.Passport, uploadDate: format(subMonths(today, 2), 'yyyy-MM-dd'), url: '#' },
        { id: 'doc-502', name: 'Miller_Headshot.jpg', category: DocumentCategory.Photo, uploadDate: format(subDays(today, 50), 'yyyy-MM-dd'), url: '#' },
        { id: 'doc-503', name: 'EmploymentContract.pdf', category: DocumentCategory.Contract, uploadDate: format(subDays(today, 60), 'yyyy-MM-dd'), url: '#' },
    ],
    renewalHistory: [],
  },
  {
    id: '6',
    name: 'Chloe Dubois',
    nationality: 'France',
    avatarUrl: 'https://i.pravatar.cc/150?u=chloe_dubois',
    jobTitle: 'Finance Analyst',
    department: 'Finance',
    currentPermit: {
      id: 'wp-106',
      permitNumber: 'VN-WP-84326',
      issueDate: format(subMonths(today, 8), 'yyyy-MM-dd'),
      expiryDate: format(addMonths(today, 16), 'yyyy-MM-dd'), // Active
      status: PermitStatus.Active,
    },
    documents: [],
    renewalHistory: [],
  },
  {
    id: '7',
    name: 'Liam O\'Connell',
    nationality: 'Ireland',
    avatarUrl: 'https://i.pravatar.cc/150?u=liam_oconnell',
    jobTitle: 'Operations Lead',
    department: 'Operations',
    currentPermit: {
      id: 'wp-107',
      permitNumber: 'VN-WP-84327',
      issueDate: format(subDays(today, 5), 'yyyy-MM-dd'), // Just renewed
      expiryDate: format(addMonths(today, 24), 'yyyy-MM-dd'), // Active
      status: PermitStatus.Active,
    },
    documents: [
        { id: 'doc-701', name: 'OConnell_Passport.pdf', category: DocumentCategory.Passport, uploadDate: format(subYears(today, 2), 'yyyy-MM-dd'), url: '#' },
        { id: 'doc-702', name: 'OConnell_OldPermit.pdf', category: DocumentCategory.OldPermit, uploadDate: format(subMonths(today, 1), 'yyyy-MM-dd'), url: '#' },
    ],
    renewalHistory: [
        { id: 'ren-hist-3', renewalApplicationDate: format(subMonths(today, 1), 'yyyy-MM-dd'), status: RenewalStatus.Approved, decisionDate: format(subDays(today, 5), 'yyyy-MM-dd') }
    ],
  },
  {
    id: '8',
    name: 'Sofia Rossi',
    nationality: 'Italy',
    avatarUrl: 'https://i.pravatar.cc/150?u=sofia_rossi',
    jobTitle: 'Junior Designer',
    department: 'Product',
    currentPermit: {
      id: 'wp-108',
      permitNumber: 'N/A',
      issueDate: 'N/A',
      expiryDate: 'N/A',
      status: PermitStatus.InProcess,
    },
    onboardingProcess: {
        currentStage: ProcessStage.DocCollection,
        steps: [
            { name: ProcessStage.DocCollection, status: ApplicationStepStatus.InProgress, date: format(subDays(today, 2), 'yyyy-MM-dd') },
            { name: ProcessStage.VendorSubmission, status: ApplicationStepStatus.Pending, date: '' },
            { name: ProcessStage.GovtApproval, status: ApplicationStepStatus.Pending, date: '' },
            { name: ProcessStage.PermitIssued, status: ApplicationStepStatus.Pending, date: '' },
        ],
        physicalDocuments: [
            { name: DocumentCategory.Passport, status: PhysicalDocumentStatus.Requested },
            { name: DocumentCategory.Contract, status: PhysicalDocumentStatus.Requested },
            { name: DocumentCategory.Degree, status: PhysicalDocumentStatus.NotRequested },
            { name: DocumentCategory.HealthCheck, status: PhysicalDocumentStatus.NotRequested },
            { name: DocumentCategory.Photo, status: PhysicalDocumentStatus.NotRequested },
        ]
    },
    documents: [],
    renewalHistory: [],
  },
  {
    id: '9',
    name: 'Omar Al-Farsi',
    nationality: 'Oman',
    avatarUrl: 'https://i.pravatar.cc/150?u=omar_alfarsi',
    jobTitle: 'Senior Accountant',
    department: 'Finance',
    currentPermit: {
      id: 'wp-109',
      permitNumber: 'VN-WP-84329',
      issueDate: format(subYears(today, 2), 'yyyy-MM-dd'),
      expiryDate: format(subDays(today, 10), 'yyyy-MM-dd'), // Expired
      status: PermitStatus.Expired,
    },
    renewalProcess: {
        currentStage: ProcessStage.VendorSubmission,
        steps: [
            { name: ProcessStage.DocCollection, status: ApplicationStepStatus.Completed, date: format(subDays(today, 40), 'yyyy-MM-dd') },
            { name: ProcessStage.VendorSubmission, status: ApplicationStepStatus.InProgress, date: format(subDays(today, 12), 'yyyy-MM-dd') },
            { name: ProcessStage.GovtApproval, status: ApplicationStepStatus.Pending, date: '' },
            { name: ProcessStage.PermitIssued, status: ApplicationStepStatus.Pending, date: '' },
        ],
        physicalDocuments: [
            { name: DocumentCategory.Passport, status: PhysicalDocumentStatus.Verified },
            { name: DocumentCategory.Contract, status: PhysicalDocumentStatus.Verified },
            { name: DocumentCategory.Degree, status: PhysicalDocumentStatus.Verified },
            { name: DocumentCategory.HealthCheck, status: PhysicalDocumentStatus.Requested }, // The bottleneck
            { name: DocumentCategory.Photo, status: PhysicalDocumentStatus.Verified },
            { name: DocumentCategory.OldPermit, status: PhysicalDocumentStatus.Verified },
        ]
    },
    documents: [
        { id: 'doc-901', name: 'AlFarsi_Passport.pdf', category: DocumentCategory.Passport, uploadDate: format(subYears(today, 2), 'yyyy-MM-dd'), url: '#' }
    ],
    renewalHistory: [
      { id: 'ren-hist-4', renewalApplicationDate: format(subYears(today, 2), 'yyyy-MM-dd'), status: RenewalStatus.Approved, decisionDate: format(subMonths(subYears(today,2),-1), 'yyyy-MM-dd') }
    ],
  },
  {
    id: '10',
    name: 'Isabella Schmidt',
    nationality: 'Germany',
    avatarUrl: 'https://i.pravatar.cc/150?u=isabella_schmidt',
    jobTitle: 'Chief Technology Officer',
    department: 'Technology',
    currentPermit: {
      id: 'wp-110',
      permitNumber: 'VN-WP-84330',
      issueDate: format(subMonths(today, 6), 'yyyy-MM-dd'),
      expiryDate: format(addMonths(today, 18), 'yyyy-MM-dd'), // Active
      status: PermitStatus.Active,
    },
    documents: [
      { id: 'doc-1001', name: 'Schmidt_Passport.pdf', category: DocumentCategory.Passport, uploadDate: format(subYears(today, 4), 'yyyy-MM-dd'), url: '#' },
      { id: 'doc-1002', name: 'Schmidt_MastersDegree.pdf', category: DocumentCategory.Degree, uploadDate: format(subYears(today, 4), 'yyyy-MM-dd'), url: '#' },
    ],
    renewalHistory: [
      { id: 'ren-hist-5', renewalApplicationDate: format(subMonths(today, 7), 'yyyy-MM-dd'), status: RenewalStatus.Approved, decisionDate: format(subMonths(today, 6), 'yyyy-MM-dd') },
      { id: 'ren-hist-6', renewalApplicationDate: format(subMonths(subYears(today, 2), 7), 'yyyy-MM-dd'), status: RenewalStatus.Approved, decisionDate: format(subMonths(subYears(today, 2), 6), 'yyyy-MM-dd') }
    ],
  },
  {
    id: '11',
    name: 'Lucas Gomes',
    nationality: 'Brazil',
    avatarUrl: 'https://i.pravatar.cc/150?u=lucas_gomes',
    jobTitle: 'Sales Executive',
    department: 'Sales',
    currentPermit: {
      id: 'wp-111',
      permitNumber: 'VN-WP-84331',
      issueDate: format(subMonths(today, 23), 'yyyy-MM-dd'),
      expiryDate: format(addDays(today, 15), 'yyyy-MM-dd'), // Expires very soon
      status: PermitStatus.ExpiresSoon,
    },
    documents: [
        { id: 'doc-1101', name: 'Passport_Gomes.pdf', category: DocumentCategory.Passport, uploadDate: format(subMonths(today, 23), 'yyyy-MM-dd'), url: '#' },
    ],
    renewalHistory: [],
  },
];