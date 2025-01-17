CREATE OR REPLACE FUNCTION increment_poll_option_vote(p_post_id uuid, p_option_id text)
RETURNS void AS $$
BEGIN
  INSERT INTO poll_option_votes (post_id, option_id, vote_count)
  VALUES (p_post_id, p_option_id, 1)
  ON CONFLICT (post_id, option_id)
  DO UPDATE SET vote_count = poll_option_votes.vote_count + 1;
END;
$$ LANGUAGE plpgsql;