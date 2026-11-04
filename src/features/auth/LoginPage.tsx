import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/useAuth';
import { isSupabaseConfigured } from '@/lib/env';

export function LoginPage() {
  const { isAuthenticated, signIn, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [isAuthenticated, navigate, user?.role]);

  const chooseDemoRole = (role: 'user' | 'admin') => {
    signIn(role);
    navigate(role === 'admin' ? '/admin' : '/');
  };

  const handleGoogleSignIn = async () => {
    if (isSigningIn) {
      return;
    }

    setIsSigningIn(true);
    await signInWithGoogle();
    setIsSigningIn(false);
  };

  return (
    <div className="page-shell mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
      <section className="hero-panel rounded-[28px] p-7 sm:p-10">
        <p className="eyebrow">{t('demo.noticeTitle')}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--ink)]">{t('login.title')}</h1>
        <p className="mt-4 max-w-2xl text-[var(--muted)]">{t('login.description')}</p>
        {isSupabaseConfigured ? (
          <div className="mt-7">
            <button
              type="button"
              onClick={() => void handleGoogleSignIn()}
              aria-disabled={isSigningIn}
              aria-busy={isSigningIn}
              className="soft-button inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-5 py-3 font-semibold text-[var(--ink)] hover:border-[var(--accent)] aria-disabled:cursor-wait aria-disabled:opacity-70 sm:w-auto"
            >
              <span aria-hidden="true" className="text-xl font-bold text-[#4285f4]">G</span>
              {isSigningIn ? t('login.googleLoading') : t('login.googleAction')}
            </button>
            <span role="status" aria-live="polite" className="sr-only">
              {isSigningIn ? t('login.googleLoading') : ''}
            </span>
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 text-sm text-[var(--muted)]">
            {t('login.googleSetup')}
          </p>
        )}

        {!isSupabaseConfigured ? (
          <>
        <p className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 text-sm leading-6 text-[var(--muted)]">
          {t('demo.notice')}
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => chooseDemoRole('user')}
            className="role-card text-left"
          >
            <span className="role-card-icon" aria-hidden="true">01</span>
            <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {t('demo.userRole')}
            </span>
            <span className="mt-2 block text-xl font-semibold text-[var(--ink)]">{t('login.memberAction')}</span>
          </button>

          <button
            type="button"
            onClick={() => chooseDemoRole('admin')}
            className="role-card role-card-primary text-left"
          >
            <span className="role-card-icon" aria-hidden="true">02</span>
            <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              {t('demo.adminRole')}
            </span>
            <span className="mt-2 block text-xl font-semibold text-white">{t('login.adminAction')}</span>
          </button>
        </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
