-- Fix the imageUrl column to support large base64 images
ALTER TABLE properties ALTER COLUMN image_url TYPE TEXT;
