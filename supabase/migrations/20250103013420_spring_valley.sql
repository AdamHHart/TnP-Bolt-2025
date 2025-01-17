/*
  # Initial Schema Setup

  1. New Tables
    - `users`
      - Custom user profile data
      - Tracks reputation and provincial information
    - `posts`
      - Main content posts including studies, polls, data, and visualizations
      - Includes voting and source verification
    - `comments`
      - User comments on posts
      - Includes voting system
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  avatar text,
  province text,
  joined_at timestamptz DEFAULT now(),
  reputation integer DEFAULT 0,
  CONSTRAINT valid_province CHECK (province IN (
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
    'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
    'Prince Edward Island', 'Quebec', 'Saskatchewan',
    'Northwest Territories', 'Nunavut', 'Yukon'
  ))
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL,
  author_id uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  source text,
  image_url text,
  votes integer DEFAULT 0,
  CONSTRAINT valid_type CHECK (type IN ('study', 'poll', 'data', 'visualization'))
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  author_id uuid REFERENCES users(id) NOT NULL,
  post_id uuid REFERENCES posts(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  votes integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Anyone can read posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);