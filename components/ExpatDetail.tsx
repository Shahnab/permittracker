

import React, { useState, useRef, useEffect } from 'react';
import { Expat, Document as DocumentType, Process, ApplicationStepStatus, PhysicalDocumentStatus, DocumentCategory, PermitStatus, RenewalStatus, RenewalRecord } from '../types';
import StatusBadge from './StatusBadge';
// FIX: Reverted to deep imports for date-fns functions to resolve module export errors.
// The barrel file (`'date-fns'`) does not seem to export members correctly in this environment.
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { ArrowLeftIcon, CheckIcon, DocumentIcon, UserIcon, ArrowPathIcon, UploadIcon, CheckCircleIcon, ExclamationIcon, ClipboardDocumentCheckIcon, ClipboardDocumentListIcon } from './Icons';

interface ExpatDetailProps {
  expat: Expat;
  onBack: () => void;
  onAddDocument: (expatId: string, document: DocumentType) => void;
  onDeleteDocument: (expatId: string, documentId: string) => void;
  onInitiateRenewal: (expatId: string) => void;
  onUpdatePhysicalDocStatus: (expatId: string, processType: 'onboarding' | 'renewal', docName: DocumentCategory, status: PhysicalDocumentStatus) => void;
  onAdvanceStep: (expatId: string, processType: 'onboarding' | 'renewal') => void;
  onAddRenewalRecord: (expatId: string, newRecordData: Omit<RenewalRecord, 'id'>) => void;
}

const ProcessTracker: React.FC<{ steps: Process['steps'] }> = ({ steps }) => {
    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Process Progress</h3>
            <ol className="relative border-l border-gray-200">                  
                {steps.map((step, index) => (
                    <li key={index} className="mb-8 ml-6">
                        <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-white ${
                            step.status === ApplicationStepStatus.Completed ? 'bg-status-green' : 
                            step.status === ApplicationStepStatus.InProgress ? 'bg-status-blue' : 'bg-gray-300'
                        }`}>
                           {step.status === ApplicationStepStatus.Completed && <CheckIcon className="w-4 h-4 text-white" />}
                        </span>
                        <h4 className="flex items-center mb-1 text-md font-semibold text-gray-900">{step.name}</h4>
                        <time className="block mb-2 text-sm font-normal leading-none text-gray-400">
                            {step.date ? `${step.status} on ${format(parseISO(step.date), 'MMM d, yyyy')}` : 'Pending'}
                        </time>
                    </li>
                ))}
            </ol>
        </div>
    )
}


const DocumentChecklist: React.FC<{
    processType: 'onboarding' | 'renewal';
    physicalDocs: Process['physicalDocuments'];
    uploadedDocs: DocumentType[];
    onUpdateStatus: (docName: DocumentCategory, status: PhysicalDocumentStatus) => void;
    onUpload: (document: Omit<DocumentType, 'id'|'uploadDate'|'url'>) => void;
}> = ({ processType, physicalDocs, uploadedDocs, onUpdateStatus, onUpload }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [categoryForUpload, setCategoryForUpload] = React.useState<DocumentCategory | null>(null);
    const [uploads, setUploads] = useState<Map<string, number>>(new Map());

    const handleUploadClick = (category: DocumentCategory) => {
        setCategoryForUpload(category);
        fileInputRef.current?.click();
    };
    
    const simulateUpload = (file: File, category: DocumentCategory) => {
        const uniqueFileName = `${file.name}-${Date.now()}`;
        setUploads(prev => new Map(prev).set(uniqueFileName, 0));

        const interval = setInterval(() => {
            setUploads(prev => {
                const newUploads = new Map(prev);
                const currentProgress = newUploads.get(uniqueFileName) || 0;
                // FIX: Explicitly cast currentProgress to a number to prevent type errors during arithmetic operations.
                const nextProgress = Math.min(Number(currentProgress) + 10, 100);
                newUploads.set(uniqueFileName, nextProgress);
                return newUploads;
            });
        }, 200);

        setTimeout(() => {
            clearInterval(interval);
            onUpload({ name: file.name, category });
            setUploads(prev => {
                const newUploads = new Map(prev);
                newUploads.delete(uniqueFileName);
                return newUploads;
            });
        }, 2200);
    };


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0 && categoryForUpload) {
            // FIX: Add explicit File type to the 'file' parameter to resolve ambiguity and ensure type safety.
            Array.from(files).forEach((file: File) => {
                 simulateUpload(file, categoryForUpload);
            });
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
        setCategoryForUpload(null);
    };
    
    const physicalStatusStyles: { [key in PhysicalDocumentStatus]: string } = {
        [PhysicalDocumentStatus.NotRequested]: 'bg-gray-200 text-gray-800',
        [PhysicalDocumentStatus.Requested]: 'bg-yellow-100 text-yellow-800',
        [PhysicalDocumentStatus.Submitted]: 'bg-blue-100 text-blue-800',
        [PhysicalDocumentStatus.Verified]: 'bg-green-100 text-green-800',
    };

    return (
        <div className="mt-4 md:mt-6 p-4 md:p-6 border rounded-lg">
            <h3 className="text-base md:text-lg font-semibold text-text-primary mb-4 flex items-center">
                <ClipboardDocumentCheckIcon className="w-4 h-4 md:w-5 md:h-5 mr-2 text-gray-400" />
                Document Checklist
            </h3>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
            <div className="overflow-x-auto">
                 <table className="w-full text-left text-xs md:text-sm">
                    <thead className="bg-gray-50 text-xs md:text-xs text-text-secondary uppercase font-semibold">
                        <tr>
                            <th className="p-2 text-text-primary">Document Name</th>
                            <th className="p-2">Digital Copy</th>
                            <th className="p-2">Physical Copy Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {physicalDocs.map(doc => {
                            const hasDigitalCopy = uploadedDocs.some(upDoc => upDoc.category === doc.name);
                            return (
                                <tr key={doc.name}>
                                    <td className="p-2 font-medium text-text-primary">{doc.name}</td>
                                    <td className="p-2">
                                        {hasDigitalCopy ? (
                                            <span className="flex items-center text-status-green font-semibold">
                                                <CheckCircleIcon className="w-4 h-4 mr-1"/> Uploaded
                                            </span>
                                        ) : (
                                            <button onClick={() => handleUploadClick(doc.name)} className="flex items-center text-brand-primary text-xs font-semibold hover:underline">
                                                <UploadIcon className="w-4 h-4 mr-1"/> Upload Now
                                            </button>
                                        )}
                                    </td>
                                    <td className="p-2">
                                        <select
                                            value={doc.status}
                                            onChange={(e) => onUpdateStatus(doc.name, e.target.value as PhysicalDocumentStatus)}
                                            className={`border-0 rounded-md text-xs font-medium focus:ring-2 focus:ring-brand-primary ${physicalStatusStyles[doc.status]}`}
                                        >
                                            {Object.values(PhysicalDocumentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {uploads.size > 0 && (
                <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-semibold text-text-primary mb-2">Uploads in Progress</h4>
                    <div className="space-y-2">
                        {Array.from(uploads.entries()).map(([fileName, progress]) => (
                            <div key={fileName}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-text-secondary truncate pr-2">{fileName.split('-').slice(0, -1).join('-')}</span>
                                    <span className="font-medium">{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-brand-primary h-1.5 rounded-full transition-all duration-200" style={{width: `${progress}%`}}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ExpatDetail: React.FC<ExpatDetailProps> = ({ expat, onBack, onAddDocument, onDeleteDocument, onInitiateRenewal, onUpdatePhysicalDocStatus, onAdvanceStep, onAddRenewalRecord }) => {
  
  const activeProcess = expat.onboardingProcess ? 'onboarding' : expat.renewalProcess ? 'renewal' : null;
  const processData = activeProcess === 'onboarding' ? expat.onboardingProcess : expat.renewalProcess;
  const canInitiateRenewal = expat.currentPermit.status === PermitStatus.ExpiresSoon && !expat.renewalProcess;
  
  const [newRenewalStatus, setNewRenewalStatus] = useState<RenewalStatus>(RenewalStatus.Approved);
  
  const handleDocumentUpload = (document: Omit<DocumentType, 'id' | 'uploadDate' | 'url'>) => {
      const newDocument: DocumentType = {
          ...document,
          id: `doc-${Date.now()}`,
          uploadDate: new Date().toISOString(),
          url: '#' // Mock URL
      };
      onAddDocument(expat.id, newDocument);
  };
  
  const handleAddRenewal = () => {
    onAddRenewalRecord(expat.id, {
        renewalApplicationDate: new Date().toISOString(),
        status: newRenewalStatus,
        decisionDate: new Date().toISOString(),
    });
    setNewRenewalStatus(RenewalStatus.Approved); // Reset form
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
      <button onClick={onBack} className="flex items-center text-sm text-brand-primary font-medium mb-4 md:mb-6">
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Expat List
      </button>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">d:gap-6">
        {/* Left Column */}
        <div className="lg:w-1/3">
            <div className="flex flex-col items-center p-4 md:p-6 border rounded-lg bg-gray-50">ay-50">
                <img src={expat.avatarUrl} alt={expat.name} className="h-20 w-20 md:h-24 md:w-24 rounded-full mb-4 ring-4 ring-white shadow-md" />
                <h2 className="text-xl md:text-2xl font-bold text-text-primary text-center">{expat.name}</h2>
                <p className="text-sm md:text-base text-text-secondary text-center">{expat.jobTitle}</p>
                <p className="text-xs md:text-sm text-text-secondary mt-1 text-center">{expat.department} Department</p>
            </div>
             <div className="mt-4 md:mt-6 p-3 md:p-4 border rounded-lg">
                <h3 className="text-base md:text-lg font-semibold text-text-primary mb-3 flex items-center"><UserIcon className="w-4 h-4 md:w-5 md:h-5 mr-2 text-gray-400"/>Personal Details</h3>
                <div className="space-y-2 text-sm">
                    <p><strong className="font-medium text-text-secondary">Nationality:</strong> {expat.nationality}</p>
                    <p><strong className="font-medium text-text-secondary">Permit No:</strong> {expat.currentPermit.permitNumber}</p>
                </div>
            </div>
             <div className="mt-4 md:mt-6 p-3 md:p-4 border rounded-lg">
                <h3 className="text-base md:text-lg font-semibold text-text-primary mb-3 flex items-center">
                    <DocumentIcon className="w-4 h-4 md:w-5 md:h-5 mr-2 text-gray-400" />
                    Work Permit Information
                </h3>
                <div className="space-y-2 text-sm">
                    <div>
                        <p className="text-text-secondary">Status</p>
                        <StatusBadge status={expat.currentPermit.status} />
                    </div>
                    <div>
                        <p className="text-text-secondary">Issue Date</p>
                        <p className="font-medium">{expat.currentPermit.issueDate !== 'N/A' ? format(parseISO(expat.currentPermit.issueDate), 'MMM d, yyyy') : 'N/A'}</p>
                    </div>
                     <div>
                        <p className="text-text-secondary">Expiry Date</p>
                        <p className="font-medium">{expat.currentPermit.expiryDate !== 'N/A' ? format(parseISO(expat.currentPermit.expiryDate), 'MMM d, yyyy') : 'N/A'}</p>
                    </div>
                </div>
            </div>
            <div className="mt-4 md:mt-6 p-3 md:p-4 border rounded-lg">
                <h3 className="text-base md:text-lg font-semibold text-text-primary mb-4 flex items-center">
                    <ClipboardDocumentListIcon className="w-4 h-4 md:w-5 md:h-5 mr-2 text-gray-400" />
                    Renewal History
                </h3>

                <div className="space-y-3 overflow-x-auto">
                    {expat.renewalHistory.length > 0 ? (
                        <table className="w-full text-left text-xs md:text-sm">d:text-sm">
                            <thead className="bg-gray-50 text-xs md:text-xs text-text-secondary uppercase">
                                <tr>
                                    <th className="p-2 font-semibold">Renewal Date</th>
                                    <th className="p-2 font-semibold">Status</th>
                                    <th className="p-2 font-semibold">Decision Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expat.renewalHistory.map(record => (
                                    <tr key={record.id}>
                                        <td className="p-2 text-text-secondary">{format(parseISO(record.renewalApplicationDate), 'MMM d, yyyy')}</td>
                                        <td className="p-2"><StatusBadge status={record.status} /></td>
                                        <td className="p-2 text-text-secondary">{format(parseISO(record.decisionDate), 'MMM d, yyyy')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-sm text-text-secondary text-center py-4">No renewal history found.</p>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t">
                    <h4 className="text-md font-semibold text-text-primary mb-2">Add New Record</h4>
                    <div className="flex items-center gap-2">
                        <select
                            value={newRenewalStatus}
                            onChange={(e) => setNewRenewalStatus(e.target.value as RenewalStatus)}
                            className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm bg-white text-text-primary"
                        >
                            {Object.values(RenewalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button
                            onClick={handleAddRenewal}
                            className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 text-sm transition-colors"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column */}
        <div className="lg:w-2/3">
            <div className="p-4 md:p-6 border rounded-lg">ed-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <h3 className="text-base md:text-lg font-semibold text-text-primary flex items-center">
                      <ArrowPathIcon className="w-4 h-4 md:w-5 md:h-5 mr-2 text-gray-400" />
                      Process Management
                  </h3>
                  {activeProcess && (
                     <button
                        onClick={() => onAdvanceStep(expat.id, activeProcess)}
                        className="w-full sm:w-auto bg-brand-primary text-white font-semibold py-2 px-3 rounded-md hover:bg-blue-700 text-xs md:text-sm transition-colors"
                      >
                          Advance to Next Stage
                      </button>
                  )}
                </div>
                
                {canInitiateRenewal && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                        <p className="font-semibold text-yellow-800">Permit renewal is due soon.</p>
                        <button 
                            onClick={() => onInitiateRenewal(expat.id)}
                            className="mt-2 bg-yellow-500 text-white font-bold py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors"
                        >
                            Initiate Renewal Process
                        </button>
                    </div>
                )}
                
                {processData ? (
                    <ProcessTracker steps={processData.steps} />
                ) : (
                    <div className="text-center text-text-secondary py-6 border-2 border-dashed rounded-lg">
                        <p>No active onboarding or renewal process.</p>
                    </div>
                )}
            </div>
            
            {processData && activeProcess && (
                <DocumentChecklist
                    processType={activeProcess}
                    physicalDocs={processData.physicalDocuments}
                    uploadedDocs={expat.documents}
                    onUpdateStatus={(docName, status) => onUpdatePhysicalDocStatus(expat.id, activeProcess, docName, status)}
                    onUpload={handleDocumentUpload}
                />
            )}
        </div>
      </div>
    </div>
  );
};

export default ExpatDetail;