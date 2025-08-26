-- Allow anonymous users to create profiles for temporary testing
-- Update the RLS policy to allow inserting profiles without authentication
DROP POLICY IF EXISTS "用戶可以創建自己的個人資料" ON public.user_profiles;

CREATE POLICY "允許創建個人資料" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (true);

-- Also update select policy to allow viewing profiles by profile_id or user_id
DROP POLICY IF EXISTS "用戶可以查看自己的個人資料" ON public.user_profiles;

CREATE POLICY "允許查看個人資料" 
ON public.user_profiles 
FOR SELECT 
USING (true);

-- Update policy to allow updating profiles
DROP POLICY IF EXISTS "用戶可以更新自己的個人資料" ON public.user_profiles;

CREATE POLICY "允許更新個人資料" 
ON public.user_profiles 
FOR UPDATE 
USING (true);