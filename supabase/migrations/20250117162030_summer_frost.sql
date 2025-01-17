/*
  # Add poll option votes tracking

  1. New Tables
    - `poll_option_votes`
      - Tracks the number of votes for each poll option
      - Links to posts table
      - Stores option_id and vote count
  
  2. Security
    - Enable RLS
    - Add policies for vote counting
*/

CREATE TABLE IF NOT EXISTS poll_option_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) NOT NULL,
  option_id text NOT NULL,
  vote_count integer DEFAULT 0,
  UNIQUE(post_id, option_id)
);

-- Enable RLS
ALTER TABLE poll_option_votes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Poll option votes are viewable by everyone"
  ON poll_option_votes FOR SELECT
  USING (true);

CREATE POLICY "System can update vote counts"
  ON poll_option_votes FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to initialize poll option votes
CREATE OR REPLACE FUNCTION initialize_poll_option_votes()
RETURNS TRIGGER AS $$
DECLARE
  option_data jsonb;
BEGIN
  IF NEW.type = 'poll' THEN
    FOR option_data IN SELECT * FROM json_array_elements(NEW.content::jsonb)
    LOOP
      INSERT INTO poll_option_votes (post_id, option_id, vote_count)
      VALUES (NEW.id, option_data->>'id', 0);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to initialize poll option votes when a poll is created
CREATE TRIGGER initialize_poll_option_votes_trigger
AFTER INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION initialize_poll_option_votes();