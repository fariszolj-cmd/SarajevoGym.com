import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase';
import type { Gym } from './types';
import type { FavoriteRepository } from './favorites';
import type { GymRepository } from './repository';

const localizedTextSchema = z.union([
  z.string(),
  z.object({ bs: z.string().optional(), en: z.string().optional() }),
]).nullable();

const gymRecordSchema = z.object({
  slug: z.string(),
  name: z.string(),
  address: z.string(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  phone: z.string(),
  website: z.string(),
  instagram: z.string(),
  recommended: z.boolean(),
  description: z.unknown(),
  editor_note: z.unknown(),
  best_for: z.array(z.string()),
  opening_hours: z.record(z.string(), z.string()),
  pros: z.unknown(),
  cons: z.unknown(),
  last_verified: z.string().nullable(),
  gym_photos: z.array(z.object({ storage_path: z.string(), sort_order: z.number() })).nullable().default([]),
  gym_amenities: z.array(z.object({ amenity_id: z.string() })).nullable().default([]),
  gym_prices: z.array(z.object({
    amount: z.coerce.number(),
    currency: z.literal('BAM'),
    plan_type: z.string(),
    friendly_label: localizedTextSchema,
  })).nullable().default([]),
});

function localizedText(value: unknown): { bs: string; en: string } {
  const parsed = localizedTextSchema.safeParse(value);
  if (!parsed.success || parsed.data === null) {
    return { bs: '', en: '' };
  }

  if (typeof parsed.data === 'string') {
    return { bs: parsed.data, en: parsed.data };
  }

  return {
    bs: parsed.data.bs ?? '',
    en: parsed.data.en ?? '',
  };
}

function localizedLists(value: unknown): { bs: string[]; en: string[] } {
  const parsed = z.object({ bs: z.array(z.string()).optional(), en: z.array(z.string()).optional() }).safeParse(value);
  return parsed.success
    ? { bs: parsed.data.bs ?? [], en: parsed.data.en ?? [] }
    : { bs: [], en: [] };
}

export function mapSupabaseGym(value: unknown): Gym {
  const row = gymRecordSchema.parse(value);
  return {
    slug: row.slug,
    name: row.name,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone,
    website: row.website,
    instagram: row.instagram,
    photos: (row.gym_photos ?? [])
      .sort((first, second) => first.sort_order - second.sort_order)
      .map((photo) => photo.storage_path),
    recommended: row.recommended,
    lastVerified: row.last_verified ?? '',
    description: localizedText(row.description),
    editorNote: localizedText(row.editor_note),
    bestFor: row.best_for,
    amenities: (row.gym_amenities ?? []).map(({ amenity_id }) => amenity_id),
    prices: (row.gym_prices ?? []).map((price) => ({
      plan: price.plan_type,
      amount: price.amount,
      currency: price.currency,
      friendlyLabel: localizedText(price.friendly_label).bs || price.plan_type,
    })),
    openingHours: row.opening_hours,
    pros: localizedLists(row.pros),
    cons: localizedLists(row.cons),
  };
}

function throwIfError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message);
  }
}

const gymRelations = `
  *,
  gym_photos(storage_path, sort_order),
  gym_amenities(amenity_id),
  gym_prices(amount, currency, plan_type, friendly_label)
`;

export const supabaseGymRepository: GymRepository = {
  async getAll() {
    const { data, error } = await getSupabaseClient()
      .from('gyms')
      .select(gymRelations)
      .order('name', { ascending: true });

    throwIfError(error);
    return z.array(z.unknown()).parse(data).map(mapSupabaseGym);
  },

  async getBySlug(slug) {
    const { data, error } = await getSupabaseClient()
      .from('gyms')
      .select(gymRelations)
      .eq('slug', slug)
      .maybeSingle();

    throwIfError(error);
    return data ? mapSupabaseGym(data) : null;
  },

  async upsert(gym) {
    const { error } = await getSupabaseClient().rpc('save_gym', { p_gym: gym });
    throwIfError(error);
  },

  async remove(slug) {
    const { error } = await getSupabaseClient().from('gyms').delete().eq('slug', slug);
    throwIfError(error);
  },
};

async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await getSupabaseClient().auth.getUser();
  if (error && error.name !== 'AuthSessionMissingError') {
    throw new Error(`Could not verify the current account: ${error.message}`);
  }
  return data.user?.id ?? null;
}

export const supabaseFavoriteRepository: FavoriteRepository = {
  async getAll() {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    const { data, error } = await getSupabaseClient()
      .from('favorites')
      .select('gym_id, gyms!inner(slug)')
      .eq('user_id', userId);

    throwIfError(error);
    return z.array(z.object({
      gym_id: z.string(),
      gyms: z.object({ slug: z.string() }),
    })).parse(data).map(({ gyms }) => gyms.slug);
  },

  async toggle(slug) {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('Sign in with Google to save gyms to your account.');
    }

    const client = getSupabaseClient();
    const { data: gym, error: gymError } = await client
      .from('gyms')
      .select('id')
      .eq('slug', slug)
      .single();

    throwIfError(gymError);
    if (!gym) {
      throw new Error('This gym is unavailable for saving.');
    }

    const { data: favorite, error: favoriteError } = await client
      .from('favorites')
      .select('gym_id')
      .eq('user_id', userId)
      .eq('gym_id', gym.id)
      .maybeSingle();

    throwIfError(favoriteError);

    if (favorite) {
      const { error } = await client
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('gym_id', gym.id);
      throwIfError(error);
    } else {
      const { error } = await client
        .from('favorites')
        .insert({ user_id: userId, gym_id: gym.id });
      throwIfError(error);
    }

    return this.getAll();
  },
};
