import { Response } from 'express';
import { AuthRequest } from '../middleware/authGuard';
import { supabase } from '../config/supabase';

// Internal helper to create a notification from other controllers
export const createNotification = async (
  userId: string,
  type: 'booking_confirmation' | 'payment_success' | 'reminder' | 'system_alert' | 'booking_cancelled' | 'payment_failed',
  title: string,
  message: string
) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          type,
          title,
          message,
          read: false
        }
      ]);

    if (error) {
      console.error('Error creating notification:', error);
    }
  } catch (err) {
    console.error('Error in createNotification helper:', err);
  }
};

export const getNotifications = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return res.status(400).json({ error: { message: error.message } });
  }

  return res.json({ notifications: data });
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: { message: error.message } });
  }

  return res.json({ notification: data });
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    return res.status(400).json({ error: { message: error.message } });
  }

  return res.json({ message: 'All notifications marked as read' });
};
