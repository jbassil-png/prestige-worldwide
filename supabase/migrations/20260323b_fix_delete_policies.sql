-- Fix missing DELETE policies and grants so users can clear their own data
-- (required by /api/dev/reset and any future self-service data deletion)

-- user_preferences: had SELECT/INSERT/UPDATE only
CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

GRANT DELETE ON user_preferences TO authenticated;

-- user_checkin_schedule: had SELECT/INSERT/UPDATE grant only (policy was FOR ALL, grant was missing DELETE)
GRANT DELETE ON user_checkin_schedule TO authenticated;
