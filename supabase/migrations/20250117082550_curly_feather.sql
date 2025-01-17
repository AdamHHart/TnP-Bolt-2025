/*
  # Add comment replies functionality

  1. Changes to Comments Table
    - Add parent_id column for threaded replies
    - Add path column for hierarchical ordering (using text)
    - Add depth column for limiting nesting levels

  2. Security
    - Update RLS policies for replies
    - Add policies for managing reply chains
*/

-- Add new columns to comments table
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES comments(id),
ADD COLUMN IF NOT EXISTS path text,
ADD COLUMN IF NOT EXISTS depth int DEFAULT 0;

-- Create index for faster hierarchical queries
CREATE INDEX IF NOT EXISTS comments_path_idx ON comments(path);

-- Create function to update comment path and depth
CREATE OR REPLACE FUNCTION update_comment_path()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.path = NEW.id::text;
    NEW.depth = 0;
  ELSE
    SELECT path INTO NEW.path
    FROM comments
    WHERE id = NEW.parent_id;
    NEW.path = NEW.path || '.' || NEW.id::text;
    NEW.depth = array_length(string_to_array(NEW.path, '.'), 1) - 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for path updates
DROP TRIGGER IF EXISTS comment_path_trigger ON comments;
CREATE TRIGGER comment_path_trigger
BEFORE INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION update_comment_path();

-- Update RLS policies
DROP POLICY IF EXISTS "Users can reply to comments" ON comments;
CREATE POLICY "Users can reply to comments"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    (
      parent_id IS NULL OR
      EXISTS (
        SELECT 1 FROM comments parent
        WHERE parent.id = parent_id
        AND array_length(string_to_array(parent.path, '.'), 1) < 5
      )
    )
  );