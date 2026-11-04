const STORAGE_KEY = 'sarajevogym-favorites';

export interface FavoriteRepository {
  getAll(): Promise<string[]>;
  toggle(slug: string): Promise<string[]>;
}

function readStoredFavoriteSlugs(): string[] {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch (error) {
    throw new Error('Saved favorites data is invalid. Clear this browser’s favorites data to continue.', {
      cause: error,
    });
  }

  if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string')) {
    throw new Error('Saved favorites data has an unexpected format.');
  }

  return parsed;
}

export const localStorageFavoriteRepository: FavoriteRepository = {
  async getAll() {
    return readStoredFavoriteSlugs();
  },

  async toggle(slug) {
    const current = readStoredFavoriteSlugs();
    const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  },
};
