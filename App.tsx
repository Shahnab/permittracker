

import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ExpatList from './components/ExpatList';
import ExpatDetail from './components/ExpatDetail';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Notifications from './components/Notifications';
import Modal from './components/Modal';
import AddExpatForm from './components/AddExpatForm';
import { Expat, View, Document, NotificationSettings, Notification as NotificationType, PermitStatus, ProcessStage, PhysicalDocumentStatus, DocumentCategory, ApplicationStepStatus, RenewalRecord, RenewalStatus } from './types';
import { EXPATS_DATA, ONBOARDING_PROCESS_TEMPLATE, RENEWAL_PROCESS_TEMPLATE } from './constants';
import { PlusIcon } from './components/Icons';
// FIX: Reverted to deep imports for date-fns functions to resolve module export errors.
// The barrel file (`'date-fns'`) does not seem to export members correctly in this environment.
import parseISO from 'date-fns/parseISO';
import differenceInDays from 'date-fns/differenceInDays';

const getPermitStatusFromDate = (expiryDateStr: string | null, leadTime: number): PermitStatus => {
    if (!expiryDateStr || expiryDateStr === 'N/A') {
        return PermitStatus.InProcess;
    }
    const now = new Date();
    const expiryDate = parseISO(expiryDateStr);
    const daysUntilExpiry = differenceInDays(expiryDate, now);

    if (daysUntilExpiry < 0) return PermitStatus.Expired;
    if (daysUntilExpiry <= leadTime) return PermitStatus.ExpiresSoon;
    return PermitStatus.Active;
};


const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [expats, setExpats] = useState<Expat[]>(EXPATS_DATA);
  const [selectedExpatId, setSelectedExpatId] = useState<string | null>(null);
  const [isAddExpatModalOpen, setIsAddExpatModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    channels: ['inApp'],
    leadTime: 60,
  });

  const handleSelectExpat = (id: string) => {
    setSelectedExpatId(id);
    setView('expatDetail');
  };
  
  const handleAddDocument = (expatId: string, document: Document) => {
    setExpats(prevExpats => 
      prevExpats.map(expat => 
        expat.id === expatId 
          ? { ...expat, documents: [...expat.documents, document] }
          : expat
      )
    );
  };

  const handleDeleteDocument = (expatId: string, documentId: string) => {
    setExpats(prevExpats => 
      prevExpats.map(expat => 
        expat.id === expatId 
          ? { ...expat, documents: expat.documents.filter(doc => doc.id !== documentId) }
          : expat
      )
    );
  };
  
  const handleSaveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    // Here you would typically persist settings to a backend
    console.log("Settings saved:", newSettings);
  };
  
  const handleInitiateRenewal = (expatId: string) => {
    setExpats(prevExpats => prevExpats.map(expat => {
      if (expat.id === expatId) {
        const newRenewalProcess = JSON.parse(JSON.stringify(RENEWAL_PROCESS_TEMPLATE));
        newRenewalProcess.steps[0].status = ApplicationStepStatus.InProgress;
        newRenewalProcess.steps[0].date = new Date().toISOString();
        return {
          ...expat,
          renewalProcess: newRenewalProcess
        };
      }
      return expat;
    }));
  };

  const handleUpdatePhysicalDocStatus = (expatId: string, processType: 'onboarding' | 'renewal', docName: DocumentCategory, status: PhysicalDocumentStatus) => {
      setExpats(prevExpats => prevExpats.map(expat => {
          if (expat.id !== expatId) return expat;

          const processKey = processType === 'onboarding' ? 'onboardingProcess' : 'renewalProcess';
          const process = expat[processKey];

          if (!process) return expat;

          const updatedDocs = process.physicalDocuments.map(doc => 
              doc.name === docName ? { ...doc, status } : doc
          );

          return { ...expat, [processKey]: { ...process, physicalDocuments: updatedDocs } };
      }));
  };

  const handleAdvanceStep = (expatId: string, processType: 'onboarding' | 'renewal') => {
      setExpats(prevExpats => prevExpats.map(expat => {
          if (expat.id !== expatId) return expat;
          
          const processKey = processType === 'onboarding' ? 'onboardingProcess' : 'renewalProcess';
          const process = expat[processKey];
          
          if (!process) return expat;

          const currentStepIndex = process.steps.findIndex(s => s.status === ApplicationStepStatus.InProgress);
          if (currentStepIndex === -1 || currentStepIndex === process.steps.length - 1) return expat; // Already at last step or no active step

          const updatedSteps = [...process.steps];
          updatedSteps[currentStepIndex] = { ...updatedSteps[currentStepIndex], status: ApplicationStepStatus.Completed, date: new Date().toISOString() };
          
          const nextStepIndex = currentStepIndex + 1;
          updatedSteps[nextStepIndex] = { ...updatedSteps[nextStepIndex], status: ApplicationStepStatus.InProgress, date: new Date().toISOString() };

          return { ...expat, [processKey]: { ...process, steps: updatedSteps, currentStage: updatedSteps[nextStepIndex].name } };
      }));
  };

  const handleSaveNewExpat = (newExpatData: Omit<Expat, 'id' | 'currentPermit' | 'documents' | 'renewalHistory' | 'onboardingProcess' | 'renewalProcess'>) => {
    
    const newOnboardingProcess = JSON.parse(JSON.stringify(ONBOARDING_PROCESS_TEMPLATE));
    newOnboardingProcess.steps[0].status = ApplicationStepStatus.InProgress;
    newOnboardingProcess.steps[0].date = new Date().toISOString();

    const newExpat: Expat = {
      id: `expat-${Date.now()}`,
      ...newExpatData,
      currentPermit: {
        id: `wp-${Date.now()}`,
        permitNumber: 'N/A',
        issueDate: 'N/A',
        expiryDate: 'N/A',
        status: PermitStatus.InProcess,
      },
      documents: [],
      renewalHistory: [],
      onboardingProcess: newOnboardingProcess
    };

    setExpats(prev => [newExpat, ...prev]);
    setIsAddExpatModalOpen(false);
  };
  
  const handleAddRenewalRecord = (expatId: string, newRecordData: Omit<RenewalRecord, 'id'>) => {
    setExpats(prevExpats =>
      prevExpats.map(expat => {
        if (expat.id === expatId) {
          const newRecord: RenewalRecord = {
            id: `ren-hist-${Date.now()}`,
            ...newRecordData,
          };
          return {
            ...expat,
            renewalHistory: [...expat.renewalHistory, newRecord],
          };
        }
        return expat;
      })
    );
  };

  const selectedExpat = useMemo(() => {
    return expats.find(e => e.id === selectedExpatId) || null;
  }, [selectedExpatId, expats]);

  const notifications = useMemo<NotificationType[]>(() => {
    if (!settings.enabled || !settings.channels.includes('inApp')) {
      return [];
    }
    const now = new Date();
    return expats
      .map(expat => {
        if (!expat.currentPermit.expiryDate || expat.currentPermit.expiryDate === 'N/A') {
            return null;
        }
        const expiryDate = parseISO(expat.currentPermit.expiryDate);
        const daysUntilExpiry = differenceInDays(expiryDate, now);

        if (daysUntilExpiry > 0 && daysUntilExpiry <= settings.leadTime) {
          return {
            id: `notif-${expat.id}`,
            expatId: expat.id,
            expatName: expat.name,
            message: `Permit for ${expat.name} expires in ${daysUntilExpiry} days.`,
            date: now.toISOString(),
          };
        }
        return null;
      })
      .filter((notification): notification is NotificationType => notification !== null)
      .sort((a, b) => differenceInDays(parseISO(expats.find(e => e.id === a.expatId)!.currentPermit.expiryDate), now) - differenceInDays(parseISO(expats.find(e => e.id === b.expatId)!.currentPermit.expiryDate), now));
  }, [expats, settings]);
  
  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard expats={expats} onSelectExpat={handleSelectExpat} />;
      case 'expats':
        return <ExpatList expats={expats} onSelectExpat={handleSelectExpat} />;
      case 'expatDetail':
        return selectedExpat ? (
          <ExpatDetail 
            key={selectedExpat.id} // Add key to force re-render on expat change
            expat={selectedExpat} 
            onBack={() => setView('expats')}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            onInitiateRenewal={handleInitiateRenewal}
            onUpdatePhysicalDocStatus={handleUpdatePhysicalDocStatus}
            onAdvanceStep={handleAdvanceStep}
            onAddRenewalRecord={handleAddRenewalRecord}
          />
        ) : <ExpatList expats={expats} onSelectExpat={handleSelectExpat} />;
      case 'reports':
        return <Reports expats={expats} />;
      case 'settings':
        return <Settings currentSettings={settings} onSave={handleSaveSettings} />;
      default:
        return <Dashboard expats={expats} onSelectExpat={handleSelectExpat}/>;
    }
  };

  const getTitle = () => {
    switch(view) {
        case 'dashboard': return 'Dashboard';
        case 'expats': return 'Expat Directory';
        case 'expatDetail': return `Expat Profile: ${selectedExpat?.name}`;
        case 'reports': return 'Reports';
        case 'settings': return 'Settings';
        default: return 'Permit Tracker';
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-text-primary">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            {/* Hamburger menu for mobile */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-text-primary">{getTitle()}</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Notifications notifications={notifications} onNotificationClick={handleSelectExpat} />
            <button 
              onClick={() => setIsAddExpatModalOpen(true)}
              className="flex items-center gap-2 bg-brand-primary text-white text-sm font-medium py-1.5 px-3 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-primary"
            >
                <PlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Add New Expat</span>
                <span className="sm:hidden">Add</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-secondary p-3 md:p-6">
          {renderView()}
        </main>
      </div>
      
      <Modal 
        isOpen={isAddExpatModalOpen} 
        title="Add New Expat" 
        onClose={() => setIsAddExpatModalOpen(false)}
      >
        <AddExpatForm 
            onSave={handleSaveNewExpat} 
            onCancel={() => setIsAddExpatModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};

export default App;