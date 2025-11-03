-- Fix user_profiles RLS to prevent public data exposure
-- Allow anonymous users to access only their own profile through test sessions

-- Drop overly permissive policies
DROP POLICY IF EXISTS "允許查看個人資料" ON public.user_profiles;
DROP POLICY IF EXISTS "允許創建個人資料" ON public.user_profiles;
DROP POLICY IF EXISTS "允許更新個人資料" ON public.user_profiles;

-- Create secure RPC function to get profile through test session
-- This prevents direct profile access while allowing session-based retrieval
CREATE OR REPLACE FUNCTION public.get_profile_by_session(session_id uuid)
RETURNS SETOF user_profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.* FROM user_profiles p
  JOIN test_sessions ts ON ts.profile_id = p.id
  WHERE ts.id = session_id
  LIMIT 1;
$$;

-- Allow anonymous users to INSERT profiles (for registration)
CREATE POLICY "Allow anonymous profile creation"
ON public.user_profiles FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Deny direct SELECT for anonymous users (must use RPC function)
CREATE POLICY "Deny direct anonymous profile reads"
ON public.user_profiles FOR SELECT
TO anon
USING (false);

-- Authenticated users can view their own profiles
CREATE POLICY "Users view own profiles"
ON public.user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users can update their own profiles
CREATE POLICY "Users update own profiles"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);