import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldErrorProps {
  error?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-red-500 animate-in fade-in slide-in-from-top-1">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span className="text-sm font-medium">{error}</span>
    </div>
  );
};
