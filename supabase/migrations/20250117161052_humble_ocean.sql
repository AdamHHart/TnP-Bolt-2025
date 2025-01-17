-- Delete all posts to start fresh
DELETE FROM poll_votes;
DELETE FROM comments;
DELETE FROM posts;

-- Reset the votes count on posts
UPDATE posts SET votes = 0;