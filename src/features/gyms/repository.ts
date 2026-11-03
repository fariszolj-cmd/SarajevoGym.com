import { gyms as defaultGyms } from './data';
import type { Gym } from './types';

const STORAGE_KEY = 'sarajevogym-gyms';

export function readGyms(): Gym[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultGyms;

    const parsed = JSON.parse(stored) as Gym[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultGyms;
  } catch {
    return defaultGyms;
  }
}

export function writeGyms(gyms: Gym[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gyms));
}

export function upsertGym(nextGym: Gym): Gym[] {
  const current = readGyms();
  const existingIndex = current.findIndex((gym) => gym.slug === nextGym.slug);

  if (existingIndex >= 0) {
    const updated = [...current];
    updated[existingIndex] = nextGym;
    writeGyms(updated);
    return updated;
  }

  const updated = [nextGym, ...current];
  writeGyms(updated);
  return updated;
}

export function removeGym(slug: string): Gym[] {
  const updated = readGyms().filter((gym) => gym.slug !== slug);
  writeGyms(updated);
  return updated;
}
