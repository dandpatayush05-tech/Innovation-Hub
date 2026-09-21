import { supabase } from '../config/supabase';
import bcrypt from 'bcryptjs';

export const isPasswordReused = async (userId: string, candidatePassword: string): Promise<boolean> => {
  const { data: history, error } = await supabase
    .from('password_history')
    .select('password_hash')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error || !history || history.length === 0) return false;

  for (const record of history) {
    const isMatch = await bcrypt.compare(candidatePassword, record.password_hash);
    if (isMatch) return true;
  }

  return false;
};

export const recordPasswordHistory = async (userId: string, newPasswordHash: string): Promise<void> => {
  // Insert new record
  await supabase.from('password_history').insert({
    user_id: userId,
    password_hash: newPasswordHash
  });

  // Fetch all records for the user ordered by created_at desc
  const { data: history } = await supabase
    .from('password_history')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Delete records beyond the last 5
  if (history && history.length > 5) {
    const idsToDelete = history.slice(5).map(r => r.id);
    await supabase
      .from('password_history')
      .delete()
      .in('id', idsToDelete);
  }
};
