import { gyms as defaultGyms } from './data';
import { gymSchema } from './schema';
import type { Gym } from './types';

const STORAGE_KEY = 'sarajevogym-gyms';

export interface GymRepository {
  getAll(): Promise<Gym[]>;
  getBySlug(slug: string): Promise<Gym | null>;
  upsert(gym: Gym): Promise<void>;
  remove(slug: string): Promise<void>;
}

function readStoredGyms(): Gym[] {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    return defaultGyms;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch (error) {
    throw new Error('Saved gym data is invalid. Clear this browser’s gym data to restore the starter listings.', {
      cause: error,
    });
  }

  const validated = gymSchema.array().safeParse(parsed);
  if (!validated.success) {
    throw new Error('Saved gym data failed validation. Clear this browser’s gym data to restore the starter listings.', {
      cause: validated.error,
    });
  }

  return validated.data;
}

function writeStoredGyms(gyms: Gym[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(gyms));
}

export const localStorageGymRepository: GymRepository = {
  async getAll() {
    return readStoredGyms();
  },

  async getBySlug(slug) {
    return readStoredGyms().find((gym) => gym.slug === slug) ?? null;
  },

  async upsert(nextGym) {
    const current = readStoredGyms();
    const existingIndex = current.findIndex((gym) => gym.slug === nextGym.slug);

    if (existingIndex < 0) {
      writeStoredGyms([nextGym, ...current]);
      return;
    }

    const updated = [...current];
    updated[existingIndex] = nextGym;
    writeStoredGyms(updated);
  },

  async remove(slug) {
    writeStoredGyms(readStoredGyms().filter((gym) => gym.slug !== slug));
  },
};
