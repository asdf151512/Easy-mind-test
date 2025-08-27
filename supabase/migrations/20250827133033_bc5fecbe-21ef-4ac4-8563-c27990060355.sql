-- Drop existing RLS policies for test_sessions
DROP POLICY IF EXISTS "用戶可以創建自己的測驗記錄" ON test_sessions;
DROP POLICY IF EXISTS "用戶可以更新自己的測驗記錄" ON test_sessions;
DROP POLICY IF EXISTS "用戶可以查看自己的測驗記錄" ON test_sessions;

-- Create new RLS policies that support anonymous users
CREATE POLICY "允許創建測驗記錄" 
ON test_sessions 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL) OR 
  (auth.uid() = user_id)
);

CREATE POLICY "允許更新測驗記錄" 
ON test_sessions 
FOR UPDATE 
USING (
  (auth.uid() IS NULL AND user_id IS NULL) OR 
  (auth.uid() = user_id)
);

CREATE POLICY "允許查看測驗記錄" 
ON test_sessions 
FOR SELECT 
USING (
  (auth.uid() IS NULL AND user_id IS NULL) OR 
  (auth.uid() = user_id)
);