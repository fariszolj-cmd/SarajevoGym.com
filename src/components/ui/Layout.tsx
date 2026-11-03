import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/useAuth';
import { business } from '@/lib/business';

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[var(--line)] bg-[var(--ink)] text-[var(--paper)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-semibold tracking-[0.2em] uppercase text-[var(--paper)]">
            {business.legal.name}
          </Link>

          <nav className="flex items-center gap-4 text-xs uppercase tracking-[0.18em] text-[var(--muted-light)]">
            <Link to="/" className="transition hover:text-[var(--paper)]">{t('nav.home')}</Link>
            <Link to="/admin" className="transition hover:text-[var(--paper)]">{t('nav.admin')}</Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-[var(--muted-light)] sm:inline">{user?.name}</span>
                <button
                  type="button"
                  onClick={signOut}
                  className="border border-[var(--line)] bg-transparent px-2 py-1 text-[var(--paper)] transition hover:border-[var(--paper)]"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link to="/login" className="transition hover:text-[var(--paper)]">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
