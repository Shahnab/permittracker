

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

const AddExpatForm: React.FC<AddExpatFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Partial<typeof initialFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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