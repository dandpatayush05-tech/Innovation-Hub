import { nameSchema, emailSchema, passwordSchema } from '../validators/authValidator';
import { checkPasswordStrength } from '../utils/passwordStrength';
import { isPasswordReused } from '../services/passwordHistoryService';
import { supabase } from '../config/supabase';
import bcrypt from 'bcryptjs';

jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn()
}));

describe('nameSchema', () => {
  it('accepts valid names with hyphens and apostrophes', () => {
    expect(nameSchema.safeParse('John O\'Connor-Smith').success).toBe(true);
  });
  it('rejects digits', () => {
    expect(nameSchema.safeParse('John123').success).toBe(false);
  });
  it('rejects symbols like @#$%^&*(),./?', () => {
    expect(nameSchema.safeParse('John@Doe').success).toBe(false);
  });
  it('rejects <2 or >50 chars', () => {
    expect(nameSchema.safeParse('A').success).toBe(false);
    expect(nameSchema.safeParse('A'.repeat(51)).success).toBe(false);
  });
});

describe('emailSchema', () => {
  it('accepts .com/.net/.gov/.org/.io', () => {
    expect(emailSchema.safeParse('user@example.com').success).toBe(true);
    expect(emailSchema.safeParse('user@example.gov').success).toBe(true);
  });
  it('rejects missing TLD', () => {
    expect(emailSchema.safeParse('user@localhost').success).toBe(false);
  });
  it('rejects malformed addresses', () => {
    expect(emailSchema.safeParse('userexample.com').success).toBe(false);
  });
});

describe('passwordSchema', () => {
  it('accepts valid passwords', () => {
    expect(passwordSchema.safeParse('Valid1!Password').success).toBe(true);
  });
  it('rejects <8 chars', () => {
    expect(passwordSchema.safeParse('Val1!').success).toBe(false);
  });
  it('rejects missing letter/digit/symbol', () => {
    expect(passwordSchema.safeParse('12345678!').success).toBe(false);
    expect(passwordSchema.safeParse('abcdefgh!').success).toBe(false);
    expect(passwordSchema.safeParse('abcdefgh1').success).toBe(false);
  });
});

describe('checkPasswordStrength', () => {
  it('rejects sequential patterns', () => {
    expect(checkPasswordStrength('12345678!', {}).ok).toBe(false);
  });
  it('rejects leetspeak substitutions', () => {
    expect(checkPasswordStrength('p@ssw0rd1!', {}).ok).toBe(false);
  });
  it('rejects plain dictionary words', () => {
    expect(checkPasswordStrength('password123!', {}).ok).toBe(false);
  });
  it('rejects passwords containing the user\'s name/email/phone/dob', () => {
    expect(checkPasswordStrength('John123!@#', { name: 'John' }).ok).toBe(false);
    expect(checkPasswordStrength('user@example.com1!', { email: 'user@example.com' }).ok).toBe(false);
  });
  it('accepts strong passwords', () => {
    expect(checkPasswordStrength('T4C7!oP9$mQv2', { name: 'John' }).ok).toBe(true);
  });
});

describe('isPasswordReused', () => {
  const mockFrom = supabase.from as jest.Mock;
  const mockCompare = bcrypt.compare as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns true for a previously-used password', async () => {
    const mockLimit = jest.fn().mockResolvedValue({
      data: [{ password_hash: 'hash1' }],
      error: null
    });
    const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

    mockFrom.mockReturnValue({ select: mockSelect });
    mockCompare.mockResolvedValue(true);

    const result = await isPasswordReused('user1', 'mypassword');
    expect(result).toBe(true);
    expect(mockCompare).toHaveBeenCalledWith('mypassword', 'hash1');
  });

  it('returns false for a new password', async () => {
    const mockLimit = jest.fn().mockResolvedValue({
      data: [{ password_hash: 'hash1' }],
      error: null
    });
    const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

    mockFrom.mockReturnValue({ select: mockSelect });
    mockCompare.mockResolvedValue(false);

    const result = await isPasswordReused('user1', 'newpassword');
    expect(result).toBe(false);
    expect(mockCompare).toHaveBeenCalledWith('newpassword', 'hash1');
  });
});
