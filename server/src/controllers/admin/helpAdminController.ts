import { Response } from 'express';
import { AuthRequest } from '../../middleware/authGuard';
import { supabase } from '../../config/supabase';
import { NotFoundError, ApiError } from '../../middleware/errorHandler';

export const getCategories = async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('help_categories')
    .select('*')
    .order('display_order');
    
  if (error) throw new ApiError(500, error.message, 'DB_ERROR', undefined);
  res.json(data);
};

export const getArticles = async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('help_articles')
    .select('*, category:help_categories(slug, title)')
    .order('display_order');
    
  if (error) throw new ApiError(500, error.message, 'DB_ERROR', undefined);
  res.json(data);
};

export const createArticle = async (req: AuthRequest, res: Response) => {
  const payload = req.body;
  const { data, error } = await supabase
    .from('help_articles')
    .insert({
      category_id: payload.categoryId,
      type: payload.type,
      question: payload.question,
      title: payload.title,
      content: payload.content,
      display_order: payload.displayOrder,
      is_published: payload.isPublished,
      updated_by: req.user!.id
    })
    .select()
    .single();

  if (error) throw new ApiError(500, error.message, 'DB_ERROR', undefined);
  res.status(201).json(data);
};

export const updateArticle = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const { data, error } = await supabase
    .from('help_articles')
    .update({
      category_id: payload.categoryId,
      type: payload.type,
      question: payload.question,
      title: payload.title,
      content: payload.content,
      display_order: payload.displayOrder,
      is_published: payload.isPublished,
      updated_by: req.user!.id
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new ApiError(500, error.message, 'DB_ERROR', undefined);
  if (!data) throw new NotFoundError('Article not found', undefined);
  res.json(data);
};

export const deleteArticle = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  // Soft delete
  const { error } = await supabase
    .from('help_articles')
    .update({
      is_published: false,
      updated_by: req.user!.id
    })
    .eq('id', id);

  if (error) throw new ApiError(500, error.message, 'DB_ERROR', undefined);
  res.status(204).send();
};

export const reorderArticles = async (req: AuthRequest, res: Response) => {
  const { updates } = req.body;
  // Batch update display_order
  for (const update of updates) {
    await supabase
      .from('help_articles')
      .update({ display_order: update.displayOrder, updated_by: req.user!.id })
      .eq('id', update.id);
  }
  res.json({ message: 'Order updated successfully' });
};
