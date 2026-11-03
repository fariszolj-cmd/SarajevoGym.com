import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPanel } from '@/features/map/MapPanel';
import { getMonthlyPrice } from '@/features/gyms/data';
import { readGyms } from '@/features/gyms/repository';
import type { Gym, SortOption } from '@/features/gyms/types';
import { business } from '@/lib/business';
import { calculateDistanceKm, formatPrice, getFallbackCenter } from '@/features/gyms/utils';

const defaultLocation = getFallbackCenter();

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
  const [priceLimit, setPriceLimit] = useState(180);
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [userLocation, setUserLocation] = useState(defaultLocation);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const gyms = readGyms();

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setLocationNotice(t('gym.nearbyCenter'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setUserLocation(defaultLocation);
        setLocationNotice(t('gym.nearbyCenter'));
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [t]);

  const filteredGyms = (() => {
    const visibleGyms = gyms.filter((gym) => {
      const matchesQuery = isGymMatch(gym, query);
      const matchesRecommended = recommendedOnly ? gym.recommended : true;
      const monthlyPrice = getMonthlyPrice(gym);
      const matchesPrice = monthlyPrice <= priceLimit;

      return matchesQuery && matchesRecommended && matchesPrice;
    });

    const withDistance = visibleGyms.map((gym) => ({
      ...gym,
      distanceKm: calculateDistanceKm(userLocation, {
        latitude: gym.latitude,
        longitude: gym.longitude,
      }),
    }));

    return withDistance.sort((left, right) => {
      if (sortBy === 'price') {
        return getMonthlyPrice(left) - getMonthlyPrice(right);
      }

      if (sortBy === 'recommended') {
        return Number(right.recommended) - Number(left.recommended);
      }

      return left.distanceKm - right.distanceKm;
    });
  })();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 rounded-none border border-stone-300 bg-[#f1eadb] p-6 shadow-none">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-700">
          {business.city} · {business.country}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
          {t('app.tagline')}
        </h1>
      </section>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.5fr_0.5fr]">
        <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
          <span>{t('home.searchPlaceholder')}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="rounded-none border border-stone-300 bg-white px-3 py-3 text-base outline-none ring-0 transition focus:border-[#d97706]"
            placeholder={t('home.searchPlaceholder')}
            aria-label={t('home.searchPlaceholder')}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
          <span>{t('home.priceLimit')}</span>
          <input
            type="range"
            min="50"
            max="220"
            step="5"
            value={priceLimit}
            onChange={(event) => setPriceLimit(Number(event.target.value))}
            aria-label={t('home.priceLimit')}
          />
          <span className="text-sm text-stone-600">{formatPrice(priceLimit)}</span>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
          <span>{t('home.sortBy')}</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            className="rounded-none border border-stone-300 bg-white px-3 py-3 text-base outline-none transition focus:border-[#d97706]"
            aria-label={t('home.sortBy')}
          >
            <option value="distance">{t('home.distance')}</option>
            <option value="price">{t('home.price')}</option>
            <option value="recommended">{t('home.recommended')}</option>
          </select>
        </label>
      </div>

      <div className="mb-6 flex items-center gap-3 text-sm text-stone-700">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={recommendedOnly}
            onChange={(event) => setRecommendedOnly(event.target.checked)}
            className="h-4 w-4 border-stone-300 accent-[#d97706]"
          />
          {t('home.recommendedOnly')}
        </label>
      </div>

      {locationNotice ? <p className="mb-6 text-sm text-stone-700">{locationNotice}</p> : null}

      <div className="mb-6">
        <MapPanel gyms={filteredGyms} />
      </div>

      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-stone-900">
          {filteredGyms.length} {t('home.results')}
        </h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {filteredGyms.map((gym) => (
          <article
            key={gym.slug}
            className="overflow-hidden border border-stone-300 bg-white transition hover:border-[#d97706]"
          >
            <div className="flex h-40 items-center justify-center bg-stone-200 text-3xl font-semibold text-stone-700">
              {gym.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-2xl font-semibold text-stone-900">{gym.name}</h3>
                {gym.recommended ? (
                  <span className="border border-[#d97706] bg-[#f7efe0] px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-[#7c4a05]">
                    Recommended
                  </span>
                ) : null}
              </div>

              <p className="mb-3 text-sm text-stone-600">{gym.address}</p>

              <div className="mb-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.1em] text-stone-700">
                {gym.amenities.slice(0, 4).map((amenity) => (
                  <span key={amenity} className="border border-stone-300 px-2 py-1">
                    {amenity}
                  </span>
                ))}
              </div>

              <div className="mb-4 flex items-center justify-between text-sm text-stone-700">
                <span>{formatPrice(getMonthlyPrice(gym))}</span>
                <span>{Math.round(gym.distanceKm)} km away</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs uppercase tracking-[0.15em] text-stone-500">
                  {t('gym.verified')}: {new Date(gym.lastVerified).toLocaleDateString('en-GB')}
                </span>
                <Link
                  to={`/gyms/${gym.slug}`}
                  className="bg-[#171717] px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-[#d97706]"
                >
                  View gym
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
