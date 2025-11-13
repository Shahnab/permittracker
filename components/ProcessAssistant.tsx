
import React, { useState } from 'react';
import { getProcessGuidance } from '../services/geminiService';
import { SparklesIcon } from './Icons';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const ProcessAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: query };
    setHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    setQuery('');

    const aiResponse = await getProcessGuidance(query);
    const aiMessage: Message = { sender: 'ai', text: aiResponse };
    setHistory(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAsk();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex items-center mb-4">
        <SparklesIcon className="h-6 w-6 text-brand-primary" />
        <h2 className="text-xl font-semibold text-text-primary ml-2">AI Process Assistant</h2>
      </div>
      <p className="text-sm text-text-secondary mb-4">Ask about work permit processes, required documents, or timelines.</p>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-text-primary'}`}>
                <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}
                 />
            </div>
          </div>
        ))}
         {isLoading && (
            <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
	                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
	                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="mt-auto flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., docs for Indian national..."
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-brand-primary focus:border-brand-primary"
          disabled={isLoading}
        />
        <button
          onClick={handleAsk}
          disabled={isLoading || !query.trim()}
          className="bg-brand-primary text-white font-semibold px-4 rounded-r-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200"
        >
          Ask
        </button>
      </div>
    </div>
  );
};

export default ProcessAssistant;
