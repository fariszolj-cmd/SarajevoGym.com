import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="border border-[var(--line)] bg-[var(--panel)] p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Admin access</p>
          <h1 className="mt-4 text-3xl font-semibold text-[var(--ink)]">You need an admin account</h1>
          <p className="mt-4 text-[var(--muted)]">Sign in with the admin role to manage gyms, pricing and verified inspection data.</p>
          <Link
            to="/login"
            className="mt-6 inline-flex border border-[var(--line)] bg-[var(--ink)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--paper)]"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
