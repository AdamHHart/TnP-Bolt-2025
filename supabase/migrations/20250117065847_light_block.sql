/*
  # Initial Schema Setup

  1. Tables
    - users: Extends Supabase auth users
    - posts: Content sharing
    - comments: Post discussions
  
  2. Security
    - Enable RLS on all tables
    - Set up policies for authenticated users
    - Allow public read access where appropriate
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Users policies
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
    
    -- Posts policies
    DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
    DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
    DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
    
    -- Comments policies
    DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
    DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
    DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
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
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL,
  author_id uuid REFERENCES public.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  source text,
  image_url text,
  votes integer DEFAULT 0,
  CONSTRAINT valid_type CHECK (type IN ('study', 'poll', 'data', 'visualization'))
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  author_id uuid REFERENCES public.users(id) NOT NULL,
  post_id uuid REFERENCES public.posts(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  votes integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = author_id);