import { z } from 'zod';
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

export const zxcvbn = new ZxcvbnFactory(options);

export const nameSchema = z.string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be at most 50 characters')
  .regex(/^[A-Za-z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");

export const emailSchema = z.string()
  .trim()
  .toLowerCase()
  .email('Invalid email address')
  .regex(/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/, "Email must have a valid domain extension");

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/\d/, 'Password must contain at least one digit')
  .regex(/[^a-zA-Z\d\s]/, 'Password must contain at least one symbol');

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema
}).superRefine((data, ctx) => {
  const { name, email, password } = data;
  if (!password) return;

  const userInputs = [name, email].filter(Boolean) as string[];
  const lowercasePassword = password.toLowerCase();

  for (const input of userInputs) {
    if (input.trim() !== '') {
      if (lowercasePassword.includes(input.trim().toLowerCase())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Password must not contain your personal information.`,
          path: ['password']
        });
        return;
      }
    }
  }

  const result = zxcvbn.check(password, userInputs);
  
  if (result.score < 3) {
    let msg = 'Password is too weak.';
    if (result.feedback.warning) {
      msg = result.feedback.warning;
    } else if (result.feedback.suggestions.length > 0) {
      msg = result.feedback.suggestions[0];
    }
    
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: msg,
      path: ['password']
    });
  }
});
