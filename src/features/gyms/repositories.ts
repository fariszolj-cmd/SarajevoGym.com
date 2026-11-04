import { isSupabaseConfigured } from '@/lib/env';
import { localStorageFavoriteRepository } from './favorites';
import { localStorageGymRepository } from './repository';
import { supabaseFavoriteRepository, supabaseGymRepository } from './supabase-repositories';

export const repositories = isSupabaseConfigured
  ? {
      gyms: supabaseGymRepository,
      favorites: supabaseFavoriteRepository,
    }
  : {
      gyms: localStorageGymRepository,
      favorites: localStorageFavoriteRepository,
    };
