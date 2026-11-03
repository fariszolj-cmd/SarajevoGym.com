import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { business } from '@/lib/business';

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[var(--line)] bg-[var(--ink)] text-[var(--paper)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-semibold tracking-[0.2em] uppercase text-[var(--paper)]">
            {business.legal.name}
          </Link>
          <nav className="flex items-center gap-5 text-xs uppercase tracking-[0.18em] text-[var(--muted-light)]">
            <Link to="/" className="transition hover:text-[var(--paper)]">{t('nav.home')}</Link>
            <Link to="/admin" className="transition hover:text-[var(--paper)]">{t('nav.admin')}</Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
