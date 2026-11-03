import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/ui/Layout';
import { AdminPage } from '@/pages/AdminPage';
import { GymDetailPage } from '@/pages/GymDetailPage';
import { HomePage } from '@/pages/HomePage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gyms/:slug" element={<GymDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
