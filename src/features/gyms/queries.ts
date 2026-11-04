import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repositories } from './repositories';

export const gymQueryKeys = {
  all: ['gyms'] as const,
  detail: (slug: string) => ['gyms', slug] as const,
};

export const favoriteQueryKeys = {
  all: ['favorites'] as const,
};

export function useGymsQuery() {
  return useQuery({
    queryKey: gymQueryKeys.all,
    queryFn: () => repositories.gyms.getAll(),
  });
}

export function useGymQuery(slug: string | undefined) {
  return useQuery({
    queryKey: gymQueryKeys.detail(slug ?? ''),
    queryFn: () => (slug ? repositories.gyms.getBySlug(slug) : Promise.resolve(null)),
    enabled: Boolean(slug),
  });
}

export function useFavoriteSlugsQuery() {
  return useQuery({
    queryKey: favoriteQueryKeys.all,
    queryFn: () => repositories.favorites.getAll(),
  });
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => repositories.favorites.toggle(slug),
    onSuccess: (slugs) => {
      queryClient.setQueryData(favoriteQueryKeys.all, slugs);
    },
  });
}

export function useSaveGymMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gym: Parameters<typeof repositories.gyms.upsert>[0]) => repositories.gyms.upsert(gym),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: gymQueryKeys.all });
    },
  });
}

export function useRemoveGymMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => repositories.gyms.remove(slug),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: gymQueryKeys.all });
    },
  });
}
