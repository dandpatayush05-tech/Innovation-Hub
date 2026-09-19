import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { ApiError } from '../utils/ApiError';


export const createContactRequest = async (req: Request, res: Response) => {
  const { data: contact, error } = await supabase
    .from('contact_requests')
    .insert(req.body)
    .select()
    .single();

  if (error || !contact) {
    throw new ApiError(500, 'Failed to submit contact request', 'INTERNAL_ERROR', undefined);
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

export const updateContactStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  const { data: contact, error } = await supabase
    .from('contact_requests')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !contact) {
    throw new ApiError(500, 'Failed to update contact request', 'INTERNAL_ERROR', undefined);
  }

  res.json({ message: 'Contact request updated successfully', contact });
};
