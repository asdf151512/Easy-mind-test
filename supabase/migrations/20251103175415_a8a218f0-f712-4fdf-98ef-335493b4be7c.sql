-- Fix INSERT policy for anonymous users on user_profiles
-- The issue is that the WITH CHECK condition needs to be more explicit

-- Drop the current INSERT policy
DROP POLICY IF EXISTS "Allow anonymous profile creation" ON public.user_profiles;

-- Create a more permissive INSERT policy specifically for anonymous users
CREATE POLICY "Allow anonymous user profile creation"
ON public.user_profiles 
FOR INSERT 
TO anon
WITH CHECK (user_id IS NULL);

-- Create separate INSERT policy for authenticated users
CREATE POLICY "Allow authenticated user profile creation"
ON public.user_profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);