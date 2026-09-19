import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface FaqItem {
  id: string;
  question: string;
  content: string;
}

export const FaqAccordion = ({ items }: { items: FaqItem[] }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
          <button
            className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
          >
            <span className="font-medium text-gray-900">{item.question}</span>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openId === item.id ? 'rotate-180' : ''}`} />
          </button>
          
          {openId === item.id && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 prose prose-blue max-w-none text-gray-600">
              <ReactMarkdown>{item.content}</ReactMarkdown>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
