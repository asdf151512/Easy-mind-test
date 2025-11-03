-- Create SECURITY DEFINER function to insert anonymous test sessions safely
CREATE OR REPLACE FUNCTION public.create_test_session(
  _profile_id uuid,
  _answers jsonb,
  _basic_result text,
  _unique_code text
)
RETURNS test_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_session test_sessions;
BEGIN
  INSERT INTO public.test_sessions (user_id, profile_id, answers, basic_result, unique_code)
  VALUES (NULL, _profile_id, _answers, _basic_result, _unique_code)
  RETURNING * INTO new_session;

  RETURN new_session;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_test_session(uuid, jsonb, text, text) TO anon, authenticated;