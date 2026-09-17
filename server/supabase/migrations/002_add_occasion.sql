-- Migration: Add occasion column to bookings and guide_bookings

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS occasion text;

ALTER TABLE guide_bookings 
ADD COLUMN IF NOT EXISTS occasion text;
