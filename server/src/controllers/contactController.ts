import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const createContactRequest = async (req: Request, res: Response) => {
  const { data: contact, error } = await supabase
    .from('contact_requests')
    .insert(req.body)
    .select()
    .single();

  if (error || !contact) {
    return res.status(500).json({ error: { message: 'Failed to submit contact request' } });
  }

  res.status(201).json({ message: 'Contact request submitted successfully', contact });
};

export const getContactRequests = async (req: Request, res: Response) => {
  const { data: contacts } = await supabase
    .from('contact_requests')
    .select('*')
    .order('created_at', { ascending: false });

  res.json({ contacts: contacts || [] });
};
