

import React, { useState } from 'react';
import { Expat } from '../types';

interface AddExpatFormProps {
  onSave: (newExpat: Omit<Expat, 'id' | 'currentPermit' | 'documents' | 'renewalHistory' | 'onboardingProcess' | 'renewalProcess'>) => void;
  onCancel: () => void;
}

const initialFormData = {
    name: '',
    nationality: '',
    jobTitle: '',
    department: '',
    avatarUrl: '',
};

// Mock Workday data for demonstration
const mockWorkdayData: { [key: string]: typeof initialFormData } = {
  'WD-001': {
    name: 'Sarah Chen',
    nationality: 'Singapore',
    jobTitle: 'Senior Software Engineer',
    department: 'Engineering',
    avatarUrl: 'https://i.pravatar.cc/150?u=sarah_chen',
  },
  'WD-002': {
    name: 'Marcus Mueller',
    nationality: 'Germany',
    jobTitle: 'Product Manager',
    department: 'Product',
    avatarUrl: 'https://i.pravatar.cc/150?u=marcus_mueller',
  },
  'WD-003': {
    name: 'Yuki Tanaka',
    nationality: 'Japan',
    jobTitle: 'Data Scientist',
    department: 'Analytics',
    avatarUrl: 'https://i.pravatar.cc/150?u=yuki_tanaka',
  },
};

const AddExpatForm: React.FC<AddExpatFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Partial<typeof initialFormData>>({});
  const [workdayId, setWorkdayId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSyncFromWorkday = async () => {
    if (!workdayId.trim()) {
      setSyncError('Please enter a Workday ID');
      return;
    }

    setIsSyncing(true);
    setSyncError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const employeeData = mockWorkdayData[workdayId.toUpperCase()];
    
    if (employeeData) {
      setFormData(employeeData);
      setSyncError('');
    } else {
      setSyncError('Employee not found in Workday. Try: WD-001, WD-002, or WD-003');
    }

    setIsSyncing(false);
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name) newErrors.name = 'Full Name is required.';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required.';
    if (!formData.jobTitle) newErrors.jobTitle = 'Job Title is required.';
    if (!formData.department) newErrors.department = 'Department is required.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };
  
  const FormRow: React.FC<{ children: React.ReactNode}> = ({ children }) => <div className="grid grid-cols-1 gap-4">{children}</div>;
  const FormField: React.FC<{ label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, error?: string, required?: boolean, type?: string, placeholder?: string }> = ({ label, name, error, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <input
            id={name}
            name={name}
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-sm ${error ? 'border-red-500' : ''} bg-white text-text-primary placeholder:text-text-secondary p-2`}
            {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-6">
        {/* Workday Sync Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-base font-semibold text-text-primary mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync from Workday
          </h3>
          <p className="text-xs text-text-secondary mb-3">Enter a Workday ID to automatically populate employee details</p>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={workdayId}
                onChange={(e) => setWorkdayId(e.target.value)}
                placeholder="e.g., WD-001"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-sm bg-white text-text-primary placeholder:text-text-secondary p-2"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSyncFromWorkday())}
              />
            </div>
            <button
              type="button"
              onClick={handleSyncFromWorkday}
              disabled={isSyncing}
              className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSyncing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Syncing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sync
                </>
              )}
            </button>
          </div>
          {syncError && (
            <p className="mt-2 text-xs text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {syncError}
            </p>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-sm text-text-secondary">or enter manually</span>
          </div>
        </div>

        <div>
            <h3 className="text-lg font-medium leading-6 text-text-primary">Personal Information</h3>
            <p className="mt-1 text-sm text-text-secondary">Enter the basic details for the new expatriate. Their permit process will be initiated once they are added.</p>
        </div>
        <FormRow>
            <FormField label="Full Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} required />
            <FormField label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} error={errors.nationality} required />
            <FormField label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={handleChange} error={errors.jobTitle} required />
            <FormField label="Department" name="department" value={formData.department} onChange={handleChange} error={errors.department} required />
            <FormField label="Avatar URL" name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} placeholder="https://..." />
        </FormRow>
      </div>

      <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-brand-primary text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
        >
          Add Expat & Start Process
        </button>
      </div>
    </form>
  );
};

export default AddExpatForm;