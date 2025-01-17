/*
  # Add poll voting functionality

  1. New Tables
    - `poll_votes`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `user_id` (uuid, references users)
      - `option_id` (text, stores the selected option ID)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `poll_votes` table
    - Add policies for:
      - Users can view vote counts
      - Users can vote once per poll
      - Users can see their own votes

  3. Indexes
    - Add index on (post_id, user_id) for faster lookups and enforcing unique votes
*/

-- Create poll votes table
CREATE TABLE IF NOT EXISTS poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  option_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Poll votes are viewable by everyone"
  ON poll_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can vote once per poll"
  ON poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);