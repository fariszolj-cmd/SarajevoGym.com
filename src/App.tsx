import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/ui/Layout';
import { AdminRoute } from '@/features/auth/AdminRoute';
import { AuthProvider } from '@/features/auth/AuthContext';
import { LoginPage } from '@/features/auth/LoginPage';
import { AdminPage } from '@/pages/AdminPage';
import { GymDetailPage } from '@/pages/GymDetailPage';
import { HomePage } from '@/pages/HomePage';

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
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
