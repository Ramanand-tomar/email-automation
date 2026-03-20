import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import DemoPage from './pages/DemoPage';
import OAuthCallback from './pages/OAuthCallback';
import PrivacyPolicy from './pages/PrivacyPolicy';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/oauth-callback" element={<OAuthCallback />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '10px',
              background: '#1f2937',
              color: '#f9fafb',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#14b8a6', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
