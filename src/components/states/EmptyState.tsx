import React from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title = 'No results found', 
  message = 'We could not find anything matching your request.', 
  icon = <FileQuestion className="w-12 h-12 text-[#2A2A2A]/40 mb-4" />,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-black/5 ${className}`}>
      {icon}
      <h3 className="text-lg font-medium text-[#2A2A2A] mb-2">{title}</h3>
      <p className="text-[#2A2A2A]/60 max-w-sm mb-6">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
