-- Fix the INSERT policy for test_sessions to properly allow anonymous users
-- The current policy is too restrictive and blocking test session creation

-- Drop the current problematic INSERT policy
DROP POLICY IF EXISTS "Allow creating test sessions" ON public.test_sessions;

-- Create a more permissive INSERT policy that allows anonymous test sessions
CREATE POLICY "Allow creating test sessions" 
ON public.test_sessions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  -- For anonymous users: allow if user_id is NULL
  (auth.uid() IS NULL AND user_id IS NULL) OR
  -- For authenticated users: allow if user_id matches their auth ID  
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  -- Additional fallback: allow if both auth.uid() and user_id are NULL
  (user_id IS NULL)
);

-- Also update the UPDATE policy to be more permissive for anonymous sessions
DROP POLICY IF EXISTS "Allow updating own test sessions" ON public.test_sessions;

CREATE POLICY "Allow updating own test sessions" 
ON public.test_sessions 
FOR UPDATE 
TO anon, authenticated
USING (
  -- For anonymous users: allow if user_id is NULL
  (auth.uid() IS NULL AND user_id IS NULL) OR
  -- For authenticated users: allow if user_id matches their auth ID
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  -- Additional fallback: allow if user_id is NULL (anonymous sessions)
  (user_id IS NULL)
);