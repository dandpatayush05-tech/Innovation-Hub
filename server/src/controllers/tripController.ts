import { Response, NextFunction } from 'express';

import { AuthRequest } from '../middleware/authGuard';



// FAQs Stubs
export const getFaqs = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  res.json({ data: [] });
};
export const createFaq = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  res.status(201).json({ data: {} });
};
export const updateFaq = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  res.json({ data: {} });
};
export const deleteFaq = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  res.status(204).send();
};

// Rules Stubs
export const getRules = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  res.json({ data: [] });
};
export const createRule = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  res.status(201).json({ data: {} });
};
export const updateRule = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  res.json({ data: {} });
};
export const deleteRule = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  res.status(204).send();
};
