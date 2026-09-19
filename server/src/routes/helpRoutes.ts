import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { asyncWrapper } from '../utils/asyncWrapper';
import { ApiError, NotFoundError } from '../utils/ApiError';

const router = Router();

router.get('/categories', asyncWrapper(async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('help_categories')
    .select('*')
    .order('display_order');
    
  if (error) throw new ApiError(500, error.message, 'DB_ERROR', undefined);
  res.json(data);
}));

router.get('/categories/:slug/articles', asyncWrapper(async (req: Request, res: Response) => {
  const { slug } = req.params;
  
  // Get Category ID
  const { data: category, error: catError } = await supabase
    .from('help_categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (catError || !category) throw new NotFoundError('Category not found', undefined);

  // Get Published Articles
  const { data: articles, error: artError } = await supabase
    .from('help_articles')
    .select('id, type, question, title, content')
    .eq('category_id', category.id)
    .eq('is_published', true)
    .order('display_order');

  if (artError) throw new ApiError(500, artError.message, 'DB_ERROR', undefined);
  res.json(articles);
}));

router.get('/search', asyncWrapper(async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') return res.json([]);

  const { data, error } = await supabase
    .from('help_articles')
    .select('id, type, question, title, content, category:help_categories(slug)')
    .eq('is_published', true)
    .or(`question.ilike.%${q}%,title.ilike.%${q}%,content.ilike.%${q}%`)
    .order('display_order')
    .limit(10);

  if (error) throw new ApiError(500, error.message, 'DB_ERROR', undefined);
  res.json(data);
}));

router.post('/contact', asyncWrapper(async (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    throw new ApiError(400, 'Name, email and message are required', 'VALIDATION_ERROR', undefined);
  }
  
  const { error } = await supabase
    .from('support_tickets')
    .insert({ name, email, message });
    
  if (error) throw new ApiError(500, error.message, 'DB_ERROR', undefined);
  res.status(201).json({ success: true });
}));

export default router;
