import React, { useState, useMemo } from 'react';
import { Expat, ProcessStage } from '../types';
import StatusBadge from './StatusBadge';
// FIX: Reverted to deep imports for date-fns functions to resolve module export errors.
// The barrel file (`'date-fns'`) does not seem to export members correctly in this environment.
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';

interface ExpatListProps {
  expats: Expat[];
  onSelectExpat: (id: string) => void;
}

const getCurrentStage = (expat: Expat): string => {
    if (expat.renewalProcess) {
        return expat.renewalProcess.currentStage;
    }
    if (expat.onboardingProcess) {
        return expat.onboardingProcess.currentStage;
    }
    return expat.currentPermit.status;
};


const ExpatList: React.FC<ExpatListProps> = ({ expats, onSelectExpat }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExpats = useMemo(() => {
    return expats.filter(expat =>
      expat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expat.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expat.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [expats, searchTerm]);

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, nationality, or job title..."
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary bg-white text-text-primary placeholder:text-text-secondary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs text-text-secondary uppercase font-semibold">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Job Title</th>
              <th className="p-3">Permit Expiry</th>
              <th className="p-3">Current Stage</th>
              <th className="p-3">Permit Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredExpats.map(expat => (
              <tr key={expat.id} onClick={() => onSelectExpat(expat.id)} className="hover:bg-gray-50 cursor-pointer">
                <td className="p-3">
                  <div className="flex items-center">
                    <img src={expat.avatarUrl} alt={expat.name} className="h-9 w-9 rounded-full" />
                    <span className="ml-3 font-medium text-text-primary">{expat.name}</span>
                  </div>
                </td>
                <td className="p-3 text-text-secondary">{expat.jobTitle}</td>
                <td className="p-3 text-text-secondary">
                    {expat.currentPermit.expiryDate !== 'N/A' ? format(parseISO(expat.currentPermit.expiryDate), 'MMM d, yyyy') : 'N/A'}
                </td>
                <td className="p-3 text-text-primary font-medium">{getCurrentStage(expat)}</td>
                <td className="p-3">
                  <StatusBadge status={expat.currentPermit.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredExpats.map(expat => (
          <div
            key={expat.id}
            onClick={() => onSelectExpat(expat.id)}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              <img src={expat.avatarUrl} alt={expat.name} className="h-12 w-12 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary truncate">{expat.name}</h3>
                <p className="text-sm text-text-secondary truncate">{expat.jobTitle}</p>
              </div>
              <StatusBadge status={expat.currentPermit.status} />
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Nationality:</span>
                <span className="text-text-primary font-medium">{expat.nationality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Permit Expiry:</span>
                <span className="text-text-primary font-medium">
                  {expat.currentPermit.expiryDate !== 'N/A' ? format(parseISO(expat.currentPermit.expiryDate), 'MMM d, yyyy') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Current Stage:</span>
                <span className="text-text-primary font-medium truncate ml-2">{getCurrentStage(expat)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpatList;