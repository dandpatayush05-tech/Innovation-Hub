import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

interface SearchResult {
  id: string;
  type: 'destination' | 'business' | 'hotel' | 'tour';
  title: string;
  summary: string;
  image: string | null;
}

export const globalSearch = async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const type = req.query.type as string | undefined;

  // We limit each table to avoid giant responses if search is too broad
  const limit = 10;
  const results: SearchResult[] = [];

  const safeQuery = `%${query}%`;

  try {
    const promises: any[] = [];

    // 1. Search Destinations
    if (!type || type === 'destination') {
      promises.push(
        supabase
          .from('destinations')
          .select('id, name, description, image_url')
          .or(`name.ilike.${safeQuery},description.ilike.${safeQuery}`)
          .limit(limit)
          .then(({ data, error }) => {
            if (!error && data) {
              data.forEach(d => {
                results.push({
                  id: d.id,
                  type: 'destination',
                  title: d.name,
                  summary: d.description,
                  image: d.image_url
                });
              });
            }
          })
      );
    }

    // 2. Search Businesses (Verified Only)
    if (!type || type === 'business') {
      promises.push(
        supabase
          .from('businesses')
          .select('id, business_name, description')
          .eq('verified', true)
          .or(`business_name.ilike.${safeQuery},description.ilike.${safeQuery}`)
          .limit(limit)
          .then(({ data, error }) => {
            if (!error && data) {
              data.forEach(b => {
                results.push({
                  id: b.id,
                  type: 'business',
                  title: b.business_name,
                  summary: b.description || 'Verified Business',
                  image: null // Businesses don't have images in current schema
                });
              });
            }
          })
      );
    }

    // 3. Search Hotels
    if (!type || type === 'hotel') {
      promises.push(
        supabase
          .from('hotels')
          .select('id, name, description, image_url')
          .or(`name.ilike.${safeQuery},description.ilike.${safeQuery}`)
          .limit(limit)
          .then(({ data, error }) => {
            if (!error && data) {
              data.forEach(h => {
                results.push({
                  id: h.id,
                  type: 'hotel',
                  title: h.name,
                  summary: h.description,
                  image: h.image_url
                });
              });
            }
          })
      );
    }

    // 4. Search Tours
    if (!type || type === 'tour') {
      promises.push(
        supabase
          .from('tours')
          .select('id, name, description, image_url')
          .or(`name.ilike.${safeQuery},description.ilike.${safeQuery}`)
          .limit(limit)
          .then(({ data, error }) => {
            if (!error && data) {
              data.forEach(t => {
                results.push({
                  id: t.id,
                  type: 'tour',
                  title: t.name,
                  summary: t.description,
                  image: t.image_url
                });
              });
            }
          })
      );
    }

    // Execute all queries concurrently
    await Promise.all(promises);

    res.json({
      data: results,
      count: results.length
    });
  } catch (error: any) {
    res.status(500).json({ error: { message: 'Failed to perform global search', details: error.message } });
  }
};
