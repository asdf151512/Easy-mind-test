-- Fix the create_anonymous_profile function to properly specify columns
DROP FUNCTION IF EXISTS public.create_anonymous_profile(text, integer, text, text);

CREATE OR REPLACE FUNCTION public.create_anonymous_profile(
  _name text,
  _age integer,
  _gender text,
  _occupation text
)
RETURNS user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_profile user_profiles;
BEGIN
  -- Explicitly specify only the columns we're inserting
  INSERT INTO public.user_profiles (name, age, gender, occupation, user_id)
  VALUES (
    trim(_name), 
    _age, 
    _gender, 
    CASE WHEN trim(coalesce(_occupation, '')) = '' THEN NULL ELSE trim(_occupation) END,
    NULL
  )
  RETURNING * INTO new_profile;

  RETURN new_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_anonymous_profile(text, integer, text, text) TO anon, authenticated;