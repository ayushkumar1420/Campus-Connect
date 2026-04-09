-- Run this in your Supabase SQL Editor

-- 1. Create Profiles Table (Linked to auth.users)
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  college_name text,
  roll_no text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Create Policy for profiles (everyone can view, users can update their own)
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Create Posts Table
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  college_name text NOT NULL,
  content text NOT NULL,
  type text NOT NULL CHECK (type IN ('note', 'query', 'general')),
  file_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT posts_pkey PRIMARY KEY (id)
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
-- Users can only see posts from their college
CREATE POLICY "Users can see posts from their college." ON public.posts 
  FOR SELECT USING (
    college_name = (SELECT college_name FROM profiles WHERE id = auth.uid()) OR auth.uid() = user_id
  );
-- Users can create posts
CREATE POLICY "Users can insert their own posts." ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- 3. Create Messages Table
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT messages_pkey PRIMARY KEY (id)
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- Users can only see messages where they are the sender or receiver
CREATE POLICY "Users can view their own messages" ON public.messages 
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can insert messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 4. Enable Supabase Realtime for Messages and Posts (Optional but good)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
