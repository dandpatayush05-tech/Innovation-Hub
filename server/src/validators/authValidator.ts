import { z } from 'zod';

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

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const updateMeSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  newPassword: passwordSchema,
  token: z.string().optional() // Make it optional for simplicity
});
