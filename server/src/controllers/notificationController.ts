import { Response } from 'express';
import { AuthRequest } from '../middleware/authGuard';
import { supabase } from '../config/supabase';
import { BadRequestError, UnauthorizedError } from '../utils/ApiError';


// SSE Clients map: userId -> Response object
const clients = new Map<string, Response>();

// Internal helper to create a notification from other controllers
export const createNotification = async (
  userId: string,
  type: 'booking_confirmation' | 'payment_success' | 'reminder' | 'system_alert' | 'booking_cancelled' | 'payment_failed' | 'review_request' | 'availability_alert',
  title: string,
  message: string
) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          type,
          title,
          message,
          read: false
        }
      ])
      .select()
      .single();

    if (error && error.code !== 'PGRST205') {
      console.error('Error creating notification:', error);
    } else if (data) {
      // Push via SSE if user is connected
      const client = clients.get(userId);
      if (client) {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    }
  } catch (err) {
    console.error('Error in createNotification helper:', err);
  }
};

export const getNotifications = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError('Unauthorized', undefined);
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    if (error.code === 'PGRST205') {
      return res.json({ notifications: [] });
    }
    throw new BadRequestError(error.message, undefined);
  }

  return res.json({ notifications: data });
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    throw new UnauthorizedError('Unauthorized', undefined);
  }

  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new BadRequestError(error.message, undefined);
  }

  return res.json({ notification: data });
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError('Unauthorized', undefined);
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    throw new BadRequestError(error.message, undefined);
  }

  return res.json({ message: 'All notifications marked as read' });
};

export const streamNotifications = (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError('Unauthorized', undefined);
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.set(userId, res);

  req.on('close', () => {
    clients.delete(userId);
  });
};
