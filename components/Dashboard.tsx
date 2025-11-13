

import React, { useMemo } from 'react';
import { Expat, PermitStatus } from '../types';
import { UsersIcon, CheckCircleIcon, ExclamationIcon, GlobeAltIcon, ReportsIcon, ClockIcon, ChartPieIcon } from './Icons';
// FIX: Reverted to deep imports for date-fns functions to resolve module export errors.
// The barrel file (`'date-fns'`) does not seem to export members correctly in this environment.
import parseISO from 'date-fns/parseISO';
import differenceInDays from 'date-fns/differenceInDays';

interface DashboardProps {
  expats: Expat[];
  onSelectExpat: (id: string) => void;
}

const statusConfig: { [key in PermitStatus]: { color: string, textClass: string, bgClass: string } } = {
    [PermitStatus.Active]: { color: 'bg-status-green', textClass: 'text-status-green', bgClass: 'bg-green-100'},
    [PermitStatus.ExpiresSoon]: { color: 'bg-status-yellow', textClass: 'text-status-yellow', bgClass: 'bg-yellow-100' },
    [PermitStatus.Expired]: { color: 'bg-status-red', textClass: 'text-status-red', bgClass: 'bg-red-100' },
    [PermitStatus.InProcess]: { color: 'bg-status-blue', textClass: 'text-status-blue', bgClass: 'bg-blue-100' },
};


const PermitStatusOverview: React.FC<{ stats: { [key in PermitStatus]: number } & { total: number } }> = ({ stats }) => {
    const segments = (Object.keys(statusConfig) as PermitStatus[]).map(status => ({
        status,
        count: stats[status],
        color: statusConfig[status].color,
        percentage: stats.total > 0 ? (stats[status] / stats.total) * 100 : 0,
    }));

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm h-full flex flex-col">
            <div className="flex items-center mb-4">
                <ChartPieIcon className="h-5 w-5 md:h-6 md:w-6 text-brand-primary" />
                <h2 className="text-lg md:text-xl font-semibold text-text-primary ml-2">Permit Status Overview</h2>
            </div>
            <div className="text-center my-4">
                <span className="text-4xl md:text-5xl font-bold text-text-primary">{stats.total}</span>
                <p className="text-sm md:text-base text-text-secondary font-medium">Total Expats</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 my-2 flex overflow-hidden">
                {segments.map(({ status, percentage, color }) => (
                    <div
                        key={status}
                        className={`${color}`}
                        style={{ width: `${percentage}%` }}
                        title={`${status}: ${stats[status]}`}
                    ></div>
                ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-auto pt-4 text-xs md:text-sm">
                {segments.map(({ status, count, color }) => (
                    <div key={status} className="flex items-center justify-between">
                         <div className="flex items-center">
                            <span className={`w-3 h-3 rounded-sm mr-2 ${color}`}></span>
                            <span>{status}</span>
                        </div>
                        <span className="font-semibold">{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const UpcomingRenewals: React.FC<{ expats: Expat[], onSelectExpat: (id: string) => void }> = ({ expats, onSelectExpat }) => {
    const expiringSoon = useMemo(() => {
        const now = new Date();
        return expats
            .filter(e => e.currentPermit.status === PermitStatus.ExpiresSoon && e.currentPermit.expiryDate !== 'N/A')
            .map(e => ({
                ...e,
                daysLeft: differenceInDays(parseISO(e.currentPermit.expiryDate), now),
            }))
            .sort((a, b) => a.daysLeft - b.daysLeft);
    }, [expats]);

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm h-full flex flex-col">
             <div className="flex items-center mb-4">
                <ClockIcon className="h-5 w-5 md:h-6 md:w-6 text-brand-primary" />
                <h2 className="text-lg md:text-xl font-semibold text-text-primary ml-2">Upcoming Renewals</h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
                {expiringSoon.length > 0 ? expiringSoon.map(expat => (
                    <div key={expat.id} onClick={() => onSelectExpat(expat.id)} className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <img src={expat.avatarUrl} alt={expat.name} className="h-10 w-10 rounded-full"/>
                        <div className="ml-3 flex-1 min-w-0">
                            <p className="font-semibold text-text-primary text-sm truncate">{expat.name}</p>
                            <p className="text-xs text-text-secondary truncate">{expat.nationality}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                             <span className="font-bold text-sm text-status-yellow">{expat.daysLeft}</span>
                             <p className="text-xs text-text-secondary">days left</p>
                        </div>
                    </div>
                )) : (
                     <div className="flex items-center justify-center h-full text-center text-text-secondary">
                        <div>
                            <CheckCircleIcon className="h-12 w-12 text-status-green mx-auto"/>
                            <p className="mt-2">No upcoming renewals.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const NationalityDistributionChart: React.FC<{ data: { [key: string]: number } }> = ({ data }) => {
    // FIX: Using more descriptive destructuring in the sort callback helps TypeScript correctly infer the types and prevents arithmetic errors.
    // FIX: Add explicit types to sort callback parameters to fix type inference issue with Object.entries.
    const sortedData = useMemo(() => Object.entries(data).sort(([, countA]: [string, number], [, countB]: [string, number]) => countB - countA), [data]);
    const values = useMemo(() => sortedData.map(([, count]) => count), [sortedData]);
    const maxCount = values.length > 0 ? Math.max(...values) : 1;
    const colors = ['bg-blue-500', 'bg-sky-500', 'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500', 'bg-indigo-500'];

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
                <GlobeAltIcon className="h-5 w-5 md:h-6 md:w-6 text-brand-primary" />
                <h2 className="text-lg md:text-xl font-semibold text-text-primary ml-2">Expats by Nationality</h2>
            </div>
            <div className="space-y-3">
                {sortedData.map(([nationality, count], index) => (
                    <div key={nationality} className="grid grid-cols-3 items-center gap-2 text-xs md:text-sm">
                        <span className="font-medium text-text-secondary truncate col-span-1">{nationality}</span>
                        <div className="bg-gray-200 rounded-full h-5 col-span-2">
                            <div
                                className={`${colors[index % colors.length]} h-5 rounded-full flex items-center justify-end pr-2 text-white font-bold text-xs transition-all duration-500`}
                                style={{ width: `${(count / maxCount) * 100}%` }}
                            >
                                {count}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PermitStatusByNationalityChart: React.FC<{ data: { [key: string]: { [key in PermitStatus]: number } & { total: number } } }> = ({ data }) => {
    // FIX: Using more descriptive destructuring in the sort callback helps TypeScript correctly infer object shapes, resolving property access errors.
    // FIX: Add explicit types to sort callback parameters to fix type inference issue with Object.entries.
    const sortedData = useMemo(() => Object.entries(data).sort(([, statsA]: [string, { total: number }], [, statsB]: [string, { total: number }]) => statsB.total - statsA.total), [data]);
    
    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
                <ReportsIcon className="h-5 w-5 md:h-6 md:w-6 text-brand-primary" />
                <h2 className="text-lg md:text-xl font-semibold text-text-primary ml-2">Permit Status by Nationality</h2>
            </div>
            <div className="space-y-4">
                {sortedData.map(([nationality, statuses]) => (
                    <div key={nationality}>
                        <div className="flex justify-between items-baseline mb-1">
                           <h4 className="font-medium text-text-secondary text-xs md:text-sm truncate">{nationality}</h4>
                           <span className="text-xs text-text-secondary ml-2 flex-shrink-0">{statuses.total} total</span>
                        </div>
                        <div className="flex h-5 w-full bg-gray-200 rounded-full overflow-hidden">
                            {(Object.keys(statusConfig) as PermitStatus[]).map(status => {
                                const count = statuses[status as keyof typeof statuses] as number;
                                if (count === 0) return null;
                                return (
                                    <div
                                        key={status}
                                        className={`${statusConfig[status].color}`}
                                        style={{ width: `${(count / statuses.total) * 100}%` }}
                                        title={`${status}: ${count}`}
                                    ></div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-2 mt-4 text-xs">
                {Object.entries(statusConfig).map(([status, config]) => (
                    <div key={status} className="flex items-center">
                        <span className={`w-3 h-3 rounded-sm mr-1.5 ${config.color}`}></span>
                        <span className="whitespace-nowrap">{status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ expats, onSelectExpat }) => {
  const permitStats = useMemo(() => {
    return expats.reduce((acc, e) => {
        acc[e.currentPermit.status]++;
        acc.total++;
        return acc;
    }, {
        [PermitStatus.Active]: 0,
        [PermitStatus.ExpiresSoon]: 0,
        [PermitStatus.Expired]: 0,
        [PermitStatus.InProcess]: 0,
        total: 0,
    });
  }, [expats]);

  const nationalityDistribution = useMemo(() => {
      return expats.reduce((acc, expat) => {
          acc[expat.nationality] = (acc[expat.nationality] || 0) + 1;
          return acc;
      }, {} as { [key: string]: number });
  }, [expats]);

  const statusByNationality = useMemo(() => {
      return expats.reduce((acc, expat) => {
          const nat = expat.nationality;
          if (!acc[nat]) {
              acc[nat] = {
                  [PermitStatus.Active]: 0,
                  [PermitStatus.ExpiresSoon]: 0,
                  [PermitStatus.Expired]: 0,
                  [PermitStatus.InProcess]: 0,
                  total: 0,
              };
          }
          acc[nat][expat.currentPermit.status]++;
          acc[nat].total++;
          return acc;
      }, {} as { [key: string]: { [key in PermitStatus]: number } & { total: number } });
  }, [expats]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <PermitStatusOverview stats={permitStats} />
      <UpcomingRenewals expats={expats} onSelectExpat={onSelectExpat} />
      <NationalityDistributionChart data={nationalityDistribution} />
      <PermitStatusByNationalityChart data={statusByNationality} />
    </div>
  );
};

export default Dashboard;