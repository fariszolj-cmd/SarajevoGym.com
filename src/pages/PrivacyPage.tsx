import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function PrivacyPage() {
  const { t } = useTranslation();
  const sections = [
    ['deviceTitle', 'deviceText'],
    ['locationTitle', 'locationText'],
    ['servicesTitle', 'servicesText'],
    ['accountsTitle', 'accountsText'],
  ] as const;

  return (
    <article className="page-shell mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
      <header className="hero-panel rounded-[28px] p-7 sm:p-10">
        <p className="eyebrow">{t('privacy.eyebrow')}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--ink)]">{t('privacy.title')}</h1>
        <p className="mt-4 max-w-2xl text-[var(--muted)]">{t('privacy.intro')}</p>
      </header>

      <div className="mt-8 space-y-5">
        {sections.map(([title, description]) => (
          <section key={title} className="content-card">
            <h2>{t(`privacy.${title}`)}</h2>
            <p>{t(`privacy.${description}`)}</p>
          </section>
        ))}
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--accent-soft)] p-5 text-sm font-medium text-[var(--accent-deep)]">
          {t('privacy.sensitiveText')}
        </p>
      </div>

      <Link to="/" className="text-link mt-8 inline-flex">{t('privacy.back')}</Link>
    </article>
  );
}
