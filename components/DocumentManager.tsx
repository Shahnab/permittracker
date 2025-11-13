import React, { useRef, useState } from 'react';
import { Document, DocumentCategory } from '../types';
// FIX: Reverted to deep imports for date-fns functions to resolve module export errors.
// The barrel file (`'date-fns'`) does not seem to export members correctly in this environment.
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { UploadIcon, FileIcon, EyeIcon, TrashIcon } from './Icons';

interface DocumentManagerProps {
  documents: Document[];
  onUpload: (document: Omit<Document, 'id' | 'uploadDate' | 'url'>) => void;
  onDelete: (documentId: string) => void;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ documents, onUpload, onDelete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>(DocumentCategory.Passport);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newDocument = {
        name: file.name,
        category: selectedCategory,
      };
      onUpload(newDocument);
      
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="mt-6 p-6 border rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
        <h3 className="text-lg font-semibold text-text-primary flex items-center">
          <FileIcon className="w-5 h-5 mr-2 text-gray-400" />
          Document Management
        </h3>
        <div className="flex items-center gap-2">
           <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm bg-white text-text-primary"
            >
                {Object.values(DocumentCategory).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
          <button 
            onClick={handleUploadClick}
            className="flex items-center gap-2 bg-brand-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm"
          >
            <UploadIcon className="w-4 h-4" />
            Upload
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
        </div>
      </div>

      <div className="space-y-3">
        {documents.length > 0 ? (
          documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
              <div className="flex items-center overflow-hidden">
                <FileIcon className="h-6 w-6 text-brand-primary flex-shrink-0" />
                <div className="ml-3 overflow-hidden">
                  <p className="font-semibold text-text-primary truncate" title={doc.name}>{doc.name}</p>
                  <p className="text-sm text-text-secondary">{doc.category} - Uploaded on {format(parseISO(doc.uploadDate), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-primary" aria-label={`View ${doc.name}`}>
                    <EyeIcon className="w-5 h-5"/>
                </a>
                <button onClick={() => onDelete(doc.id)} className="text-gray-400 hover:text-status-red" aria-label={`Delete ${doc.name}`}>
                    <TrashIcon className="w-5 h-5"/>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-text-secondary py-6 border-2 border-dashed rounded-lg">
            <p>No documents uploaded yet.</p>
            <p className="text-sm">Click 'Upload' to add the first document.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentManager;