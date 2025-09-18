-- Fix critical security vulnerability in test_sessions table
-- Current policies allow anonymous users to see ALL test sessions where user_id IS NULL
-- This exposes sensitive psychological data to the public

-- Drop existing problematic policies
DROP POLICY IF EXISTS "允許查看測驗記錄" ON public.test_sessions;
DROP POLICY IF EXISTS "允許創建測驗記錄" ON public.test_sessions;
DROP POLICY IF EXISTS "允許更新測驗記錄" ON public.test_sessions;

-- Create secure policies that protect sensitive psychological data

-- 1. Authenticated users can view their own test sessions
CREATE POLICY "Authenticated users can view own sessions" 
ON public.test_sessions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 2. Anonymous users can only view sessions by unique_code (for sharing results)
-- This requires the application to explicitly filter by unique_code
CREATE POLICY "Anonymous access via unique_code only" 
ON public.test_sessions 
FOR SELECT 
TO anon
USING (false); -- Deny direct access, must use RPC functions

-- 3. Allow creation of new test sessions for both authenticated and anonymous users
CREATE POLICY "Allow creating test sessions" 
ON public.test_sessions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL) OR 
  (auth.uid() = user_id)
);

-- 4. Allow updating test sessions (for payment status, full results, etc.)
CREATE POLICY "Allow updating own test sessions" 
ON public.test_sessions 
FOR UPDATE 
TO anon, authenticated
USING (
  (auth.uid() IS NULL AND user_id IS NULL) OR 
  (auth.uid() = user_id)
);

-- Create a secure RPC function for anonymous users to access sessions by unique_code
CREATE OR REPLACE FUNCTION public.get_test_session_by_code(session_code text)
RETURNS SETOF public.test_sessions
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.test_sessions 
  WHERE unique_code = session_code
  LIMIT 1;
$$;

-- Grant execute permission to anonymous users for the RPC function
GRANT EXECUTE ON FUNCTION public.get_test_session_by_code(text) TO anon;