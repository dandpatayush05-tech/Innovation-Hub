import { Request, Response } from 'express';
import ContactRequest from '../models/ContactRequest';

export const createContactRequest = async (req: Request, res: Response) => {
  const contact = new ContactRequest(req.body);
  await contact.save();
  res.status(201).json({ message: 'Contact request submitted successfully', contact });
};

export const getContactRequests = async (req: Request, res: Response) => {
  const contacts = await ContactRequest.find().sort({ createdAt: -1 });
  res.json({ contacts });
};
