-- Fix user_accounts RLS: add INSERT, UPDATE, DELETE policies for authenticated users
-- Previously only SELECT was granted; manual account inserts from onboarding were silently blocked.

CREATE POLICY "Users can insert own accounts"
  ON user_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON user_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON user_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Also grant INSERT/UPDATE/DELETE at the table level (SELECT was already granted)
GRANT INSERT, UPDATE, DELETE ON user_accounts TO authenticated;
