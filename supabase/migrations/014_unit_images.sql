-- Add images array to units table
ALTER TABLE units ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
