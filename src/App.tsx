import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/ui/Layout';
import { AdminRoute } from '@/features/auth/AdminRoute';
import { AuthProvider } from '@/features/auth/AuthContext';
import { HomePage } from '@/pages/HomePage';

const AdminPage = lazy(() => import('@/pages/AdminPage').then(({ AdminPage }) => ({ default: AdminPage })));
const GymDetailPage = lazy(() => import('@/pages/GymDetailPage').then(({ GymDetailPage }) => ({ default: GymDetailPage })));
const LoginPage = lazy(() => import('@/features/auth/LoginPage').then(({ LoginPage }) => ({ default: LoginPage })));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage').then(({ PrivacyPage }) => ({ default: PrivacyPage })));
const SavedPage = lazy(() => import('@/pages/SavedPage').then(({ SavedPage }) => ({ default: SavedPage })));
const TermsPage = lazy(() => import('@/pages/TermsPage').then(({ TermsPage }) => ({ default: TermsPage })));

function PageMetadata() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const page = pathname === '/saved'
      ? 'saved'
      : pathname === '/admin'
        ? 'admin'
        : pathname === '/login'
          ? 'login'
          : pathname === '/privacy'
            ? 'privacy'
            : pathname === '/terms'
              ? 'terms'
              : pathname.startsWith('/gyms/')
                ? 'gym'
                : 'home';

    document.title = t(`seo.${page}Title`);
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) {
      description.content = t(`seo.${page}Description`);
    }
  }, [pathname, t]);

  return null;
}

function App() {
  const { t } = useTranslation();

  return (
    <AuthProvider>
      <Layout>
        <PageMetadata />
        <Suspense fallback={<p role="status" aria-busy="true" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{t('app.loadingPage')}</p>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/gyms/:slug" element={<GymDetailPage />} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </AuthProvider>
  );
}

export default App;
