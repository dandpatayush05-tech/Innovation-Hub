import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { parseApiError } from '../../utils/apiError';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, className = '' }) => {
  const { message, code } = parseApiError(error);

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-red-50/50 rounded-2xl border border-red-100 ${className}`}>
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-red-900 mb-2">Something went wrong</h3>
      <p className="text-red-700/80 mb-6 max-w-md">
        {message}
        {code && code !== 'UNKNOWN_ERROR' && <span className="block mt-1 text-xs opacity-70">Error code: {code}</span>}
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-white text-red-700 font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};
