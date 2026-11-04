import { localStorageFavoriteRepository } from './favorites';
import { localStorageGymRepository } from './repository';

export const repositories = {
  gyms: localStorageGymRepository,
  favorites: localStorageFavoriteRepository,
};
