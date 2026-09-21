import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

const options = {
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  translations: zxcvbnEnPackage.translations,
};

const zxcvbn = new ZxcvbnFactory(options);

interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  petName?: string;
  address?: string;
}

interface StrengthResult {
  ok: boolean;
  score: number;
  reasons: string[];
}

export const checkPasswordStrength = (password: string, personalInfo: PersonalInfo): StrengthResult => {
  const reasons: string[] = [];
  let ok = true;
  
  // Extract non-empty personal info strings
  const userInputs: string[] = [];
  const lowercasePassword = password.toLowerCase();
  
  for (const [key, value] of Object.entries(personalInfo)) {
    if (value && typeof value === 'string' && value.trim() !== '') {
      const trimmedVal = value.trim();
      userInputs.push(trimmedVal);
      
      // Separately check if password contains personal info
      if (lowercasePassword.includes(trimmedVal.toLowerCase())) {
         ok = false;
         reasons.push(`Password must not contain your ${key}.`);
      }
    }
  }

  // Zxcvbn check
  const result = zxcvbn.check(password, userInputs);
  
  if (result.score < 3) {
    ok = false;
    reasons.push('Password is too weak. Please use a stronger password.');
    if (result.feedback.warning) {
      reasons.push(result.feedback.warning);
    }
    result.feedback.suggestions.forEach((suggestion: string) => {
      if (suggestion) {
        reasons.push(suggestion);
      }
    });
  }

  return { ok, score: result.score, reasons };
};
