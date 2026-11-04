import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useFavoriteSlugsQuery,
  useGymsQuery,
  useToggleFavoriteMutation,
} from '@/features/gyms/queries';
import { calculateDistanceKm, formatPrice, getFallbackCenter } from '@/features/gyms/utils';
import { getMonthlyPrice } from '@/features/gyms/data';

export function SavedPage() {
  const { t } = useTranslation();
  const favoritesQuery = useFavoriteSlugsQuery();
  const gymsQuery = useGymsQuery();
  const toggleFavoriteMutation = useToggleFavoriteMutation();
  const [announcement, setAnnouncement] = useState('');
  const favorites = favoritesQuery.data ?? [];
  const gyms = gymsQuery.data ?? [];
  const savedGyms = gyms.filter((gym) => favorites.includes(gym.slug));

  if (favoritesQuery.isPending || gymsQuery.isPending) {
    return <p role="status" className="mx-auto max-w-4xl px-4 py-16 text-center text-[var(--muted)]">Loading saved gyms…</p>;
  }

  if (favoritesQuery.isError || gymsQuery.isError) {
    return (
      <p role="alert" className="mx-auto max-w-4xl px-4 py-16 text-center text-red-900">
        Could not load saved gyms. {favoritesQuery.error?.message ?? gymsQuery.error?.message}
      </p>
    );
  }

  if (savedGyms.length === 0) {
    return (
      <div className="page-shell mx-auto max-w-3xl px-4 py-16">
        <div className="hero-panel rounded-[28px] p-8 text-center">
          <p className="eyebrow">{t('saved.eyebrow')}</p>
          <h1 className="mt-4 text-4xl font-semibold text-[var(--ink)]">{t('saved.emptyTitle')}</h1>
          <p className="mt-4 text-[var(--muted)]">{t('saved.emptyText')}</p>
          <Link
            to="/"
            className="soft-button mt-6 inline-flex bg-[var(--ink)] px-5 py-3 text-sm font-medium uppercase tracking-[0.12em] text-[var(--paper)]"
          >
            {t('saved.explore')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      <section className="hero-panel mb-8 rounded-[28px] p-6 sm:p-8">
        <p className="eyebrow">{t('saved.eyebrow')}</p>
        <h1 className="mt-4 text-4xl font-semibold text-[var(--ink)]">{t('saved.title')}</h1>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {savedGyms.map((gym) => {
          const center = getFallbackCenter();
          const distance = Math.round(calculateDistanceKm(center, {
            latitude: gym.latitude,
            longitude: gym.longitude,
          }));

          return (
            <article key={gym.slug} className="result-card rounded-[24px] p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--ink)]">{gym.name}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{gym.address}</p>
                </div>
                {gym.recommended ? (
                  <span className="border border-[var(--accent)] bg-[var(--accent-soft)] px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-[var(--accent-deep)]">
                    {t('home.recommendedBadge')}
                  </span>
                ) : null}
              </div>

              <div className="mb-4 flex items-center justify-between text-sm text-[var(--muted)]">
                <span className="font-medium text-[var(--ink)]">{formatPrice(getMonthlyPrice(gym))}</span>
                <span>{distance} km away</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">
                  {t('saved.verified')} {new Date(gym.lastVerified).toLocaleDateString('en-GB')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={toggleFavoriteMutation.isPending}
                    onClick={() => toggleFavoriteMutation.mutate(gym.slug, {
                      onSuccess: () => setAnnouncement(t('demo.removed')),
                    })}
                    aria-label={`${t('home.removeFavorite')}: ${gym.name}`}
                    className="soft-button rounded-full border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--ink)] hover:border-[var(--accent)]"
                  >
                    {t('saved.remove')}
                  </button>
                  <Link
                    to={`/gyms/${gym.slug}`}
                    className="soft-button rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--paper)] transition hover:bg-[var(--accent-deep)]"
                  >
                    {t('saved.viewGym')}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {toggleFavoriteMutation.isError ? (
        <p role="alert" className="mt-5 text-sm text-red-800">
          Could not update your saved gyms. {toggleFavoriteMutation.error.message}
        </p>
      ) : null}
    </div>
  );
}
