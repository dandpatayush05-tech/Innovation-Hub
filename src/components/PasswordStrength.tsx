import React from 'react';
import { zxcvbn } from '../schemas/authSchema';

interface PasswordStrengthProps {
  password?: string;
  userInputs?: string[];
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, userInputs = [] }) => {
  if (!password) return null;

  const result = zxcvbn.check(password, userInputs.filter(Boolean));
  const score = result.score;
  
  let label = 'Weak';
  let colorClass = 'bg-red-500';
  let widthClass = 'w-1/4';
  
  if (score === 1) {
    label = 'Weak';
    colorClass = 'bg-red-500';
    widthClass = 'w-1/4';
  } else if (score === 2) {
    label = 'Fair';
    colorClass = 'bg-yellow-500';
    widthClass = 'w-2/4';
  } else if (score === 3) {
    label = 'Good';
    colorClass = 'bg-blue-500';
    widthClass = 'w-3/4';
  } else if (score === 4) {
    label = 'Strong';
    colorClass = 'bg-green-500';
    widthClass = 'w-full';
  }

  let textClass = 'text-red-500';
  if (score === 2) textClass = 'text-yellow-500';
  if (score === 3) textClass = 'text-blue-500';
  if (score === 4) textClass = 'text-green-500';

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-500">Password strength:</span>
        <span className={`text-xs font-bold ${textClass}`}>{label}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div className={`${colorClass} ${widthClass} h-1.5 rounded-full transition-all duration-300`} />
      </div>
    </div>
  );
};
