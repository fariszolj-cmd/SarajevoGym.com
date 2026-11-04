import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function TermsPage() {
  const { t } = useTranslation();
  const sections = [
    ['dataTitle', 'dataText'],
    ['demoTitle', 'demoText'],
    ['mapTitle', 'mapText'],
    ['launchTitle', 'launchText'],
  ] as const;

  return (
    <article className="page-shell mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
      <header className="hero-panel rounded-[28px] p-7 sm:p-10">
        <p className="eyebrow">{t('terms.eyebrow')}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--ink)]">{t('terms.title')}</h1>
        <p className="mt-4 max-w-2xl text-[var(--muted)]">{t('terms.intro')}</p>
      </header>

      <div className="mt-8 space-y-5">
        {sections.map(([title, description]) => (
          <section key={title} className="content-card">
            <h2>{t(`terms.${title}`)}</h2>
            <p>{t(`terms.${description}`)}</p>
          </section>
        ))}
      </div>

      <Link to="/" className="text-link mt-8 inline-flex">{t('terms.back')}</Link>
    </article>
  );
}
