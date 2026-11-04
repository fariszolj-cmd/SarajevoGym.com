import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/ui/Layout';
import { AdminRoute } from '@/features/auth/AdminRoute';
import { AuthProvider } from '@/features/auth/AuthContext';
import { LoginPage } from '@/features/auth/LoginPage';
import { AdminPage } from '@/pages/AdminPage';
import { GymDetailPage } from '@/pages/GymDetailPage';
import { HomePage } from '@/pages/HomePage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { SavedPage } from '@/pages/SavedPage';
import { TermsPage } from '@/pages/TermsPage';

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
  return (
    <AuthProvider>
      <Layout>
        <PageMetadata />
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
      </Layout>
    </AuthProvider>
  );
}

export default App;
