import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { business } from '@/lib/business';

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="border-b border-stone-300 bg-[#171717] text-stone-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-semibold tracking-[0.2em] uppercase">
            {business.legal.name}
          </Link>
          <nav className="flex items-center gap-4 text-sm uppercase tracking-[0.12em] text-stone-200">
            <Link to="/">{t('nav.home')}</Link>
            <Link to="/admin">{t('nav.admin')}</Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
