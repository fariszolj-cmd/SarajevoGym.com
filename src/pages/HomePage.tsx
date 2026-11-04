import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPanel } from '@/features/map/MapPanel';
import { getMonthlyPrice } from '@/features/gyms/data';
import {
  useFavoriteSlugsQuery,
  useGymsQuery,
  useToggleFavoriteMutation,
} from '@/features/gyms/queries';
import type { Gym, SortOption } from '@/features/gyms/types';
import { business } from '@/lib/business';
import { calculateDistanceKm, formatPrice, getFallbackCenter } from '@/features/gyms/utils';

const defaultLocation = getFallbackCenter();
const emptyGyms: Gym[] = [];
const emptyFavoriteSlugs: string[] = [];

function isGymMatch(gym: Gym, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return (
    gym.name.toLowerCase().includes(normalized) ||
    gym.address.toLowerCase().includes(normalized) ||
    gym.bestFor.some((entry) => entry.toLowerCase().includes(normalized))
  );
}

export function HomePage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [priceLimit, setPriceLimit] = useState(150);
  const [hasLocation, setHasLocation] = useState<boolean | null>(() =>
    typeof navigator !== 'undefined' && 'geolocation' in navigator ? null : false,
  );
  const [sortBy, setSortBy] = useState<SortOption>(() => (
    typeof navigator !== 'undefined' && 'geolocation' in navigator ? 'distance' : 'recommended'
  ));
  const [userLocation, setUserLocation] = useState(defaultLocation);
  const [announcement, setAnnouncement] = useState('');
  const gymsQuery = useGymsQuery();
  const favoriteSlugsQuery = useFavoriteSlugsQuery();
  const toggleFavoriteMutation = useToggleFavoriteMutation();
  const favoriteSlugs = favoriteSlugsQuery.data ?? emptyFavoriteSlugs;
  const gyms = gymsQuery.data ?? emptyGyms;

  const setQuickFilter = (mode: 'all' | 'recommended' | 'favorites') => {
    setRecommendedOnly(mode === 'recommended');
    setFavoritesOnly(mode === 'favorites');
  };

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setHasLocation(true);
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setHasLocation(false);
        setUserLocation(defaultLocation);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [t]);

  const activeSortBy = hasLocation === false && sortBy === 'distance' ? 'recommended' : sortBy;

  const filteredGyms = useMemo(() => {
    const visibleGyms = gyms.filter((gym) => {
      const matchesQuery = isGymMatch(gym, query);
      const matchesRecommended = recommendedOnly ? gym.recommended : true;
      const matchesFavorites = favoritesOnly ? favoriteSlugs.includes(gym.slug) : true;
      const monthlyPrice = getMonthlyPrice(gym);
      const matchesPrice = monthlyPrice <= priceLimit;

      return matchesQuery && matchesRecommended && matchesFavorites && matchesPrice;
    });

    const withDistance = visibleGyms.map((gym) => ({
      ...gym,
      distanceKm: hasLocation === true
        ? calculateDistanceKm(userLocation, {
            latitude: gym.latitude,
            longitude: gym.longitude,
          })
        : null,
    }));

    return withDistance.sort((left, right) => {
      if (activeSortBy === 'price') {
        return getMonthlyPrice(left) - getMonthlyPrice(right);
      }

      if (activeSortBy === 'recommended') {
        return Number(right.recommended) - Number(left.recommended);
      }

      if (left.distanceKm === null || right.distanceKm === null) {
        return 0;
      }

      return left.distanceKm - right.distanceKm;
    });
  }, [activeSortBy, favoritesOnly, favoriteSlugs, gyms, hasLocation, priceLimit, query, recommendedOnly, userLocation]);

  const handleToggleFavorite = (slug: string) => {
    const removing = favoriteSlugs.includes(slug);
    toggleFavoriteMutation.mutate(slug, {
      onSuccess: () => setAnnouncement(t(removing ? 'demo.removed' : 'demo.saved')),
    });
  };

  return (
    <div className="page-shell mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {hasLocation === false ? t('home.locationUnavailable') : ''}
      </p>
      <section className="hero-panel mb-8 rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              {business.city} · {business.country}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
              {t('app.tagline')}
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-3 text-left">
            <div className="metric-pill rounded-2xl px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">{t('home.gymsMetric')}</div>
              <div className="mt-1 text-lg font-semibold text-[var(--ink)]">{gyms.length}</div>
            </div>
            <div className="metric-pill rounded-2xl px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">{t('home.savedMetric')}</div>
              <div className="mt-1 text-lg font-semibold text-[var(--ink)]">{favoriteSlugs.length}</div>
            </div>
            <div className="metric-pill rounded-2xl px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">{t('home.topMetric')}</div>
              <div className="mt-1 text-lg font-semibold text-[var(--ink)]">{filteredGyms.filter((gym) => gym.recommended).length}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="control-panel mb-6 grid gap-4 rounded-[24px] p-4 lg:grid-cols-[1.2fr_0.55fr_0.45fr]">
        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--muted)]">
          <span>{t('home.searchPlaceholder')}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="border border-[var(--line)] bg-[var(--paper)] px-3 py-3 text-base text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
            placeholder={t('home.searchPlaceholder')}
            aria-label={t('home.searchPlaceholder')}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--muted)]">
          <span>{t('home.priceLimit')}</span>
          <select
            value={priceLimit}
            onChange={(event) => setPriceLimit(Number(event.target.value))}
            className="border border-[var(--line)] bg-[var(--paper)] px-3 py-3 text-base text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
            aria-label={t('home.priceLimit')}
          >
            {[50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150].map((amount) => (
              <option key={amount} value={amount}>
                {formatPrice(amount)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--muted)]">
          <span>{t('home.sortBy')}</span>
          <select
            value={activeSortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            className="border border-[var(--line)] bg-[var(--paper)] px-3 py-3 text-base text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
            aria-label={t('home.sortBy')}
          >
            <option value="distance" disabled={hasLocation !== true}>
              {hasLocation === true ? t('home.distance') : t('home.distanceUnavailable')}
            </option>
            <option value="price">{t('home.price')}</option>
            <option value="recommended">{t('home.recommended')}</option>
          </select>
        </label>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
        {[
          { label: t('home.allGyms'), value: 'all', active: !recommendedOnly && !favoritesOnly },
          { label: t('home.recommendedOnly'), value: 'recommended', active: recommendedOnly },
          { label: t('home.favoritesOnly'), value: 'favorites', active: favoritesOnly },
        ].map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setQuickFilter(filter.value as 'all' | 'recommended' | 'favorites')}
            aria-pressed={filter.active}
            className={`rounded-full border px-4 py-2 transition ${
              filter.active
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-deep)]'
                : 'border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:border-[var(--accent)]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {hasLocation === false ? (
        <p className="mb-6 text-sm text-[var(--muted)]">
          {t('home.locationUnavailable')}
        </p>
      ) : null}
      {gymsQuery.isPending ? (
        <p role="status" className="mb-6 text-sm text-[var(--muted)]">Loading gym listings…</p>
      ) : null}
      {gymsQuery.isError || favoriteSlugsQuery.isError ? (
        <p role="alert" className="mb-6 border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          Could not load gym data from this browser. {gymsQuery.error?.message ?? favoriteSlugsQuery.error?.message}
        </p>
      ) : null}
      {toggleFavoriteMutation.isError ? (
        <p role="alert" className="mb-6 border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          Could not update your saved gyms. {toggleFavoriteMutation.error.message}
        </p>
      ) : null}

      <section
        aria-labelledby="gym-results-title"
        className="discovery-layout mb-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]"
      >
        <div className="map-shell rounded-[24px] xl:sticky xl:top-24">
          <div className="map-caption">
            <h2>{t('home.mapTitle')}</h2>
            <span>{filteredGyms.length} {t('home.mapPins')}</span>
          </div>
          <MapPanel gyms={filteredGyms} />
      </div>

        <div className="results-panel">
          <div className="mb-3 flex items-center justify-between">
        <h2 id="gym-results-title" aria-live="polite" aria-atomic="true" className="text-2xl font-semibold text-[var(--ink)]">
          {filteredGyms.length} {t('home.results')}
        </h2>
      </div>

      {filteredGyms.length === 0 ? (
        <section className="content-card text-center">
          <h3 className="text-xl font-semibold text-[var(--ink)]">{t('home.noResultsTitle')}</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">{t('home.noResultsText')}</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setRecommendedOnly(false);
              setFavoritesOnly(false);
              setPriceLimit(150);
            }}
            className="soft-button mt-5 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-[var(--paper)] hover:bg-[var(--accent-deep)]"
          >
            {t('home.clearFilters')}
          </button>
        </section>
      ) : null}

      <div className="grid gap-4">
        {filteredGyms.map((gym) => (
          <article key={gym.slug} className="result-card rounded-[24px]">
            <div className="relative flex h-40 items-center justify-center border-b border-[var(--line)] bg-[linear-gradient(135deg,#f5eee5,#f0e5dc)] text-3xl font-semibold text-[var(--ink)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,98,29,0.08),transparent_45%)]" />
              <span className="relative">{gym.name.slice(0, 2).toUpperCase()}</span>
            </div>
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-2xl font-semibold text-[var(--ink)]">{gym.name}</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleFavorite(gym.slug)}
                    disabled={toggleFavoriteMutation.isPending}
                    className="soft-button border border-[var(--line)] bg-[var(--paper)] px-2 py-1 text-sm text-[var(--ink)] transition hover:border-[var(--accent)]"
                    aria-label={favoriteSlugs.includes(gym.slug) ? t('home.removeFavorite') : t('home.addFavorite')}
                  >
                    {favoriteSlugs.includes(gym.slug) ? '♥' : '♡'}
                  </button>
                  {gym.recommended ? (
                    <span className="border border-[var(--accent)] bg-[var(--accent-soft)] px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-[var(--accent-deep)]">
                      {t('home.recommendedBadge')}
                    </span>
                  ) : null}
                </div>
              </div>

              <p className="mb-3 text-sm text-[var(--muted)]">{gym.address}</p>

              <div className="mb-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em] text-[var(--ink)]">
                {gym.amenities.slice(0, 4).map((amenity) => (
                  <span key={amenity} className="border border-[var(--line)] bg-[var(--panel)] px-2 py-1">
                    {amenity}
                  </span>
                ))}
              </div>

              <div className="mb-4 flex items-center justify-between text-sm text-[var(--muted)]">
                <span className="font-medium text-[var(--ink)]">{formatPrice(getMonthlyPrice(gym))}</span>
                {gym.distanceKm !== null ? (
                  <span>{t('home.distanceAway', { distance: Math.round(gym.distanceKm) })}</span>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">
                  {t('home.verifiedOn')} {new Date(gym.lastVerified).toLocaleDateString('en-GB')}
                </span>
                <Link
                  to={`/gyms/${gym.slug}`}
                  className="soft-button bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--paper)] transition hover:bg-[var(--accent)]"
                >
                  {t('home.viewGym')}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
        </div>
      </section>
    </div>
  );
}
