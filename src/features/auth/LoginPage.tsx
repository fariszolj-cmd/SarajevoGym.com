import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = (role: 'user' | 'admin') => {
    signIn(role);
    navigate(role === 'admin' ? '/admin' : '/');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="border border-[var(--line)] bg-[var(--panel)] p-8 shadow-[0_18px_45px_rgba(14,19,28,0.12)]">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Authentication</p>
        <h1 className="mt-4 text-4xl font-semibold text-[var(--ink)]">Access the app</h1>
        <p className="mt-4 text-[var(--muted)]">
          Continue as a member or sign in as an admin to manage verified gym data in Sarajevo.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleSignIn('user')}
            className="border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-left"
          >
            <span className="block text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Member</span>
            <span className="mt-2 block text-lg font-semibold text-[var(--ink)]">Continue as user</span>
          </button>

          <button
            type="button"
            onClick={() => handleSignIn('admin')}
            className="border border-[var(--line)] bg-[var(--ink)] px-4 py-3 text-left text-[var(--paper)]"
          >
            <span className="block text-xs uppercase tracking-[0.18em] text-[var(--muted-light)]">Admin</span>
            <span className="mt-2 block text-lg font-semibold">Continue as admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
