/*
  # Fix poll initialization function

  1. Changes
    - Update initialize_poll_option_votes function to properly handle string JSON
    - Add proper error handling
*/

CREATE OR REPLACE FUNCTION initialize_poll_option_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'poll' THEN
    INSERT INTO poll_option_votes (post_id, option_id, vote_count)
    SELECT 
      NEW.id,
      (value->>'id')::text,
      0
    FROM json_array_elements(NEW.content::json) AS value;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to initialize poll options: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;