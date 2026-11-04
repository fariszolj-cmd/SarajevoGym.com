import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { localStorageFavoriteRepository } from './favorites';
import { localStorageGymRepository } from './repository';
import { gyms as starterGyms } from './data';

function installBrowserStorage() {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  };
  vi.stubGlobal('window', { localStorage: storage });
  return values;
}

describe('localStorage gym repository', () => {
  beforeEach(() => {
    installBrowserStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns starter listings when no local edits exist', async () => {
    await expect(localStorageGymRepository.getAll()).resolves.toEqual(starterGyms);
  });

  it('upserts and removes gyms from local storage', async () => {
    const gym = structuredClone(starterGyms[0]);
    gym.name = 'Updated local gym';

    await localStorageGymRepository.upsert(gym);
    await expect(localStorageGymRepository.getBySlug(gym.slug)).resolves.toMatchObject({
      name: 'Updated local gym',
    });

    await localStorageGymRepository.remove(gym.slug);
    await expect(localStorageGymRepository.getBySlug(gym.slug)).resolves.toBeNull();
  });

  it('rejects malformed or schema-invalid stored gyms instead of silently resetting', async () => {
    const values = installBrowserStorage();
    values.set('sarajevogym-gyms', '[{"slug":"broken"}]');

    await expect(localStorageGymRepository.getAll()).rejects.toThrow(/failed validation/i);
  });
});

describe('localStorage favorite repository', () => {
  beforeEach(() => {
    installBrowserStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds and removes a favorite idempotently through toggling', async () => {
    await expect(localStorageFavoriteRepository.toggle('iron-rhythm')).resolves.toEqual(['iron-rhythm']);
    await expect(localStorageFavoriteRepository.getAll()).resolves.toEqual(['iron-rhythm']);
    await expect(localStorageFavoriteRepository.toggle('iron-rhythm')).resolves.toEqual([]);
  });

  it('surfaces invalid favorite storage', async () => {
    const values = installBrowserStorage();
    values.set('sarajevogym-favorites', '{"not":"an array"}');

    await expect(localStorageFavoriteRepository.getAll()).rejects.toThrow(/unexpected format/i);
  });
});
