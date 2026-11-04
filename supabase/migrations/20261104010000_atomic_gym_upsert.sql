create function public.save_gym(p_gym jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_gym_id uuid;
begin
  insert into public.gyms (
    slug,
    name,
    address,
    latitude,
    longitude,
    phone,
    website,
    instagram,
    status,
    recommended,
    description,
    editor_note,
    best_for,
    opening_hours,
    pros,
    cons,
    last_verified,
    source,
    created_by
  )
  values (
    p_gym ->> 'slug',
    p_gym ->> 'name',
    p_gym ->> 'address',
    (p_gym ->> 'latitude')::double precision,
    (p_gym ->> 'longitude')::double precision,
    coalesce(p_gym ->> 'phone', ''),
    coalesce(p_gym ->> 'website', ''),
    coalesce(p_gym ->> 'instagram', ''),
    'published',
    coalesce((p_gym ->> 'recommended')::boolean, false),
    coalesce(p_gym -> 'description', '{"bs":"","en":""}'::jsonb),
    coalesce(p_gym -> 'editorNote', '{"bs":"","en":""}'::jsonb),
    coalesce(array(select jsonb_array_elements_text(p_gym -> 'bestFor')), '{}'),
    coalesce(p_gym -> 'openingHours', '{}'::jsonb),
    coalesce(p_gym -> 'pros', '{"bs":[],"en":[]}'::jsonb),
    coalesce(p_gym -> 'cons', '{"bs":[],"en":[]}'::jsonb),
    nullif(p_gym ->> 'lastVerified', '')::date,
    'manual',
    (select auth.uid())
  )
  on conflict (slug) do update set
    name = excluded.name,
    address = excluded.address,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    phone = excluded.phone,
    website = excluded.website,
    instagram = excluded.instagram,
    status = excluded.status,
    recommended = excluded.recommended,
    description = excluded.description,
    editor_note = excluded.editor_note,
    best_for = excluded.best_for,
    opening_hours = excluded.opening_hours,
    pros = excluded.pros,
    cons = excluded.cons,
    last_verified = excluded.last_verified,
    source = excluded.source
  returning id into v_gym_id;

  insert into public.amenities (id, label, icon)
  select distinct
    amenity_id,
    jsonb_build_object('bs', amenity_id, 'en', amenity_id),
    ''
  from jsonb_array_elements_text(coalesce(p_gym -> 'amenities', '[]'::jsonb)) as amenity(amenity_id)
  on conflict (id) do nothing;

  delete from public.gym_amenities
  where gym_id = v_gym_id;

  insert into public.gym_amenities (gym_id, amenity_id)
  select v_gym_id, amenity_id
  from jsonb_array_elements_text(coalesce(p_gym -> 'amenities', '[]'::jsonb)) as amenity(amenity_id);

  delete from public.gym_prices
  where gym_id = v_gym_id;

  insert into public.gym_prices (
    gym_id,
    amount,
    currency,
    plan_type,
    friendly_label,
    source,
    last_verified,
    submitted_by
  )
  select
    v_gym_id,
    (price ->> 'amount')::numeric,
    coalesce(price ->> 'currency', 'BAM'),
    price ->> 'plan',
    jsonb_build_object(
      'bs', coalesce(price ->> 'friendlyLabel', price ->> 'plan'),
      'en', coalesce(price ->> 'friendlyLabel', price ->> 'plan')
    ),
    'manual',
    nullif(p_gym ->> 'lastVerified', '')::date,
    (select auth.uid())
  from jsonb_array_elements(coalesce(p_gym -> 'prices', '[]'::jsonb)) as item(price);

  delete from public.gym_photos
  where gym_id = v_gym_id;

  insert into public.gym_photos (gym_id, storage_path, sort_order)
  select v_gym_id, photo.storage_path, photo.ordinality::integer
  from jsonb_array_elements_text(coalesce(p_gym -> 'photos', '[]'::jsonb))
    with ordinality as photo(storage_path, ordinality);

  return v_gym_id;
end;
$$;

revoke all on function public.save_gym(jsonb) from public, anon, authenticated;
grant execute on function public.save_gym(jsonb) to authenticated;
