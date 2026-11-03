import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gyms } from '@/features/gyms/data';
import { formatPrice } from '@/features/gyms/utils';
import { amenities } from '@/features/gyms/data';

export function GymDetailPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language.startsWith('bs') ? 'bs' : 'en';
  const gym = gyms.find((item) => item.slug === slug);

  if (!gym) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold text-stone-900">Gym not found</h1>
        <Link to="/" className="mt-6 inline-block bg-[#171717] px-5 py-3 text-sm uppercase tracking-[0.12em] text-stone-50">
          Back to listings
        </Link>
      </div>
    );
  }

  const dynamicDescription = gym.description[currentLanguage as 'bs' | 'en'];
  const note = gym.editorNote[currentLanguage as 'bs' | 'en'];
  const pros = gym.pros[currentLanguage as 'bs' | 'en'];
  const cons = gym.cons[currentLanguage as 'bs' | 'en'];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 overflow-hidden border border-stone-300 bg-white">
        <div className="flex h-72 items-center justify-center bg-stone-200 text-4xl font-semibold text-stone-700">
          {gym.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold text-stone-900">{gym.name}</h1>
              <p className="mt-2 text-stone-600">{gym.address}</p>
            </div>
            {gym.recommended ? (
              <span className="border border-[#d97706] bg-[#f7efe0] px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-[#7c4a05]">
                Recommended
              </span>
            ) : null}
          </div>

          <p className="max-w-3xl text-base leading-7 text-stone-700">{dynamicDescription}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.7fr]">
        <section className="space-y-8">
          <div className="border border-stone-300 bg-white p-6">
            <h2 className="mb-4 text-2xl font-semibold text-stone-900">{t('gym.ourTake')}</h2>
            <p className="text-stone-700">{note}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {gym.bestFor.map((tag) => (
                <span key={tag} className="border border-stone-300 px-2 py-1 text-xs uppercase tracking-[0.12em] text-stone-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-stone-300 bg-white p-6">
            <h2 className="mb-4 text-2xl font-semibold text-stone-900">{t('gym.plans')}</h2>
            <div className="grid gap-3">
              {gym.prices.map((price) => (
                <div key={`${gym.slug}-${price.plan}`} className="flex items-center justify-between border border-stone-200 p-3">
                  <span className="uppercase tracking-[0.12em] text-stone-700">{price.friendlyLabel}</span>
                  <strong className="text-xl font-semibold text-stone-900">{formatPrice(price.amount)}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-stone-300 bg-white p-6">
            <h2 className="mb-4 text-2xl font-semibold text-stone-900">{t('gym.amenities')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {gym.amenities.map((slug) => {
                const item = amenities[slug as keyof typeof amenities];
                if (!item) return null;
                return (
                  <div key={slug} className="flex items-center gap-3 border border-stone-200 p-3">
                    <span>{item.icon}</span>
                    <span className="text-sm text-stone-700">{item.label[currentLanguage as 'bs' | 'en']}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="border border-stone-300 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-stone-900">{t('gym.hours')}</h2>
            <ul className="space-y-2 text-sm text-stone-700">
              {Object.entries(gym.openingHours).map(([day, hours]) => (
                <li key={day} className="flex items-center justify-between border-b border-stone-200 pb-2 last:border-none last:pb-0">
                  <span className="capitalize">{day}</span>
                  <span>{hours}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-stone-300 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-stone-900">Contact</h2>
            <ul className="space-y-3 text-sm text-stone-700">
              <li>{t('gym.phone')}: {gym.phone}</li>
              <li>{t('gym.website')}: <a href={gym.website} className="text-[#7c4a05] underline">{gym.website}</a></li>
              <li>{t('gym.instagram')}: {gym.instagram}</li>
              <li>{t('gym.verified')}: {new Date(gym.lastVerified).toLocaleDateString('en-GB')}</li>
            </ul>
          </div>

          <div className="border border-stone-300 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-stone-900">{t('gym.pros')}</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-stone-700">
              {pros.map((item) => <li key={item}>{item}</li>)}
            </ul>

            <h2 className="mb-4 mt-6 text-xl font-semibold text-stone-900">{t('gym.cons')}</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-stone-700">
              {cons.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
