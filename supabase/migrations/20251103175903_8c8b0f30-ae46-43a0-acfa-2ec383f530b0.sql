-- Create SECURITY DEFINER function to insert anonymous profiles and return the row
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
  INSERT INTO public.user_profiles(name, age, gender, occupation, user_id)
  VALUES (trim(_name), _age, _gender, nullif(trim(coalesce(_occupation, '')), ''))
  RETURNING * INTO new_profile;

  RETURN new_profile;
END;
$$;

-- Grant execute to anon and authenticated so client can call it
GRANT EXECUTE ON FUNCTION public.create_anonymous_profile(text, integer, text, text) TO anon, authenticated;