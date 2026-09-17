-- Migration: Add reviews table to supabase_realtime publication

ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
