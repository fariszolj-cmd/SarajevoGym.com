create function public.promote_user_to_admin(target_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(btrim(target_email));
  target_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required'
      using errcode = '42501';
  end if;

  if normalized_email is null
    or normalized_email = ''
    or normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  then
    raise exception 'Enter a valid email address'
      using errcode = '22023';
  end if;

  select id
  into target_user_id
  from auth.users
  where lower(email) = normalized_email
  limit 1;

  if target_user_id is null then
    raise exception 'No registered account was found for that email. Ask the person to sign in with Google first.'
      using errcode = 'P0002';
  end if;

  update public.profiles
  set role = 'admin'
  where id = target_user_id;

  if not found then
    raise exception 'The account profile is not ready yet. Ask the person to sign in again.'
      using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.promote_user_to_admin(text) from public, anon, authenticated;
grant execute on function public.promote_user_to_admin(text) to authenticated;
