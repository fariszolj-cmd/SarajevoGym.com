import { useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFavoriteSlugsQuery } from '@/features/gyms/queries';
import { useAuth } from '@/features/auth/useAuth';
import { business } from '@/lib/business';

export function Layout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const { authError, user, isAuthenticated, isAdmin, signOut } = useAuth();
  const { data: favoriteSlugs } = useFavoriteSlugsQuery();
  const savedCount = favoriteSlugs?.length;

  useEffect(() => {
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <a href="#main-content" className="skip-link">{t('nav.skip')}</a>
      <header className="app-header sticky top-0 z-[1000] border-b border-white/10 bg-[var(--ink)] text-[var(--paper)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="brand-link inline-flex items-center gap-3 text-[var(--paper)]">
            <span className="brand-symbol" aria-hidden="true">SG</span>
            <span>
              <span className="block text-sm font-bold tracking-[0.16em] uppercase">{business.legal.name}</span>
              <span className="block text-[10px] tracking-[0.14em] text-[var(--muted-light)]">FIND YOUR TRAINING PLACE</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-1 text-xs text-[var(--muted-light)] sm:gap-2">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>{t('nav.home')}</NavLink>
            <NavLink to="/saved" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              {t('nav.saved')} {savedCount !== undefined && savedCount > 0 ? `(${savedCount})` : ''}
            </NavLink>
            {isAdmin ? (
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>{t('nav.admin')}</NavLink>
            ) : null}

            {isAuthenticated ? (
              <>
                <span className="hidden px-2 text-[var(--muted-light)] sm:inline">{user?.name}</span>
                <button type="button" onClick={signOut} className="nav-action">{t('nav.signOut')}</button>
              </>
            ) : (
              <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
                {t('nav.login')}
              </NavLink>
            )}

            <div className="locale-switch" role="group" aria-label={t('nav.language')}>
              <button
                type="button"
                onClick={() => void i18n.changeLanguage('bs')}
                aria-pressed={i18n.language.startsWith('bs')}
                aria-label={t('nav.bosnian')}
              >
                BS
              </button>
              <button
                type="button"
                onClick={() => void i18n.changeLanguage('en')}
                aria-pressed={i18n.language.startsWith('en')}
                aria-label={t('nav.english')}
              >
                EN
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main ref={mainRef} id="main-content" tabIndex={-1} className="min-h-[65vh] outline-none">
        {authError ? (
          <div role="alert" className="mx-auto mt-5 max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">{authError}</p>
          </div>
        ) : null}
        {children}
      </main>

      <footer className="app-footer mt-16 border-t border-[var(--line)] bg-[var(--ink)] text-[var(--paper)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-bold tracking-[0.16em] uppercase">{business.legal.name}</p>
            <p className="mt-2 max-w-md text-sm text-[var(--muted-light)]">{t('footer.note')}</p>
          </div>
          <nav aria-label={t('footer.legal')} className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--muted-light)]">
            <Link to="/privacy" className="footer-link">{t('footer.privacy')}</Link>
            <Link to="/terms" className="footer-link">{t('footer.terms')}</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
