

import React, { useMemo } from 'react';
import { Expat, ProcessStage, PhysicalDocumentStatus, ApplicationStepStatus } from '../types';
// FIX: Reverted to deep imports for date-fns functions to resolve module export errors.
// The barrel file (`'date-fns'`) does not seem to export members correctly in this environment.
import differenceInDays from 'date-fns/differenceInDays';
import parseISO from 'date-fns/parseISO';
import { ClockIcon, ClipboardDocumentCheckIcon, UsersIcon } from './Icons';

interface ReportsProps {
  expats: Expat[];
}

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, subtext?: string }> = ({ icon: Icon, title, value, subtext }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm flex items-start">
        <div className="p-3 rounded-full bg-blue-100 text-brand-primary">
            <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
            <p className="text-sm text-text-secondary font-medium">{title}</p>
            <p className="text-2xl font-semibold text-text-primary">{value}</p>
            {subtext && <p className="text-xs text-text-secondary mt-1">{subtext}</p>}
        </div>
    </div>
);

const PipelineChart: React.FC<{title: string, data: { [key: string]: number }, stages: string[]}> = ({ title, data, stages }) => {
    // FIX: Added a type assertion to address an issue where Object.values was not inferring the correct numeric array type.
    const maxInPipeline = Math.max(...(Object.values(data) as number[]), 1);
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
            <p className="text-sm text-text-secondary mb-6">Number of expats currently at each stage.</p>
            <div className="space-y-4">
                {stages.map(stage => (
                    <div key={stage} className="flex items-center gap-4">
                        <span className="w-40 text-sm text-text-secondary truncate">{stage}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6">
                            <div 
                                className="bg-brand-primary h-6 rounded-full flex items-center justify-start pl-3 text-white text-xs font-bold transition-all duration-500"
                                style={{ width: `${((data[stage] || 0) / maxInPipeline) * 100}%` }}
                                title={`${data[stage] || 0} expats`}
                            >
                              {data[stage] || 0}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const Reports: React.FC<ReportsProps> = ({ expats }) => {
    
    const processMetrics = useMemo(() => {
        const inOnboarding = expats.filter(e => e.onboardingProcess);
        const inRenewal = expats.filter(e => e.renewalProcess);

        const pipelineStages = Object.values(ProcessStage).filter(s => s !== ProcessStage.NotStarted && s !== ProcessStage.Complete);

        const onboardingPipeline: { [key: string]: number } = {};
        inOnboarding.forEach(e => {
            const stage = e.onboardingProcess!.currentStage;
            onboardingPipeline[stage] = (onboardingPipeline[stage] || 0) + 1;
        });

        const renewalPipeline: { [key: string]: number } = {};
        inRenewal.forEach(e => {
            const stage = e.renewalProcess!.currentStage;
            renewalPipeline[stage] = (renewalPipeline[stage] || 0) + 1;
        });
        
        // Physical Document Status
        const outstandingPhysicalDocs = [...inOnboarding, ...inRenewal].map(expat => {
            const process = expat.onboardingProcess || expat.renewalProcess;
            if (!process) return null;
            
            const outstanding = process.physicalDocuments
                .filter(doc => doc.status !== PhysicalDocumentStatus.Verified)
                .map(doc => ({ name: doc.name, status: doc.status }));

            return {
                id: expat.id,
                name: expat.name,
                avatarUrl: expat.avatarUrl,
                process: expat.onboardingProcess ? 'Onboarding' : 'Renewal',
                outstanding,
            }
        }).filter(item => item && item.outstanding.length > 0);


        // Stage Durations
        const allProcesses = [...inOnboarding.map(e => e.onboardingProcess!), ...inRenewal.map(e => e.renewalProcess!)];
        const durations: { [key: string]: number[] } = {};
        allProcesses.forEach(process => {
            for (let i = 1; i < process.steps.length; i++) {
                const prevStep = process.steps[i-1];
                const currentStep = process.steps[i];
                if (prevStep.status === ApplicationStepStatus.Completed && currentStep.date && prevStep.date) {
                    const key = `${prevStep.name} → ${currentStep.name}`;
                    if (!durations[key]) durations[key] = [];
                    const duration = differenceInDays(parseISO(currentStep.date), parseISO(prevStep.date));
                    durations[key].push(duration);
                }
            }
        });
        const avgDurations: { [key: string]: number } = {};
        for (const key in durations) {
            avgDurations[key] = Math.round(durations[key].reduce((a, b) => a + b, 0) / durations[key].length);
        }

        return {
            inOnboardingCount: inOnboarding.length,
            inRenewalCount: inRenewal.length,
            pipelineStages,
            onboardingPipeline,
            renewalPipeline,
            outstandingPhysicalDocs,
            avgTimeToSubmit: avgDurations[`${ProcessStage.DocCollection} → ${ProcessStage.VendorSubmission}`]
        }
    }, [expats]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-text-primary">Process & Efficiency Report</h2>
                <p className="text-text-secondary mt-1">An overview of application pipelines and HR process performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={UsersIcon} title="Expats in Onboarding" value={processMetrics.inOnboardingCount} />
                <StatCard icon={UsersIcon} title="Expats in Renewal" value={processMetrics.inRenewalCount} />
                <StatCard icon={ClockIcon} title="Avg. Time to Submit" value={processMetrics.avgTimeToSubmit ? `${processMetrics.avgTimeToSubmit} days` : 'N/A'} subtext="Doc Collection → Vendor Submission." />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PipelineChart title="Onboarding Pipeline" data={processMetrics.onboardingPipeline} stages={processMetrics.pipelineStages} />
                <PipelineChart title="Renewal Pipeline" data={processMetrics.renewalPipeline} stages={processMetrics.pipelineStages} />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                    <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2 text-gray-400" />
                    Physical Document Collection Status
                </h3>
                 <p className="text-sm text-text-secondary mb-6">Expats with outstanding physical documents required for their current process.</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs text-text-secondary uppercase font-semibold">
                            <tr>
                                <th className="p-3">Expat</th>
                                <th className="p-3">Process</th>
                                <th className="p-3">Outstanding Documents</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {processMetrics.outstandingPhysicalDocs.length > 0 ? processMetrics.outstandingPhysicalDocs.map(item => (
                                <tr key={item!.id}>
                                    <td className="p-3">
                                        <div className="flex items-center">
                                            <img src={item!.avatarUrl} alt={item!.name} className="h-9 w-9 rounded-full" />
                                            <span className="ml-3 font-medium text-text-primary">{item!.name}</span>
                                        </div>
                                    </td>
                                     <td className="p-3 text-text-secondary">{item!.process}</td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-2">
                                            {item!.outstanding.map(doc => (
                                                <span key={doc.name} className="px-2 py-1 text-xs font-medium bg-yellow-100 text-status-yellow rounded-full">{doc.name} ({doc.status})</span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="text-center p-4 text-text-secondary">All required physical documents have been verified.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;