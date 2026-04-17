import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleId = params.get('googleId');

    if (!googleId) {
      setError('Authentication failed or was cancelled. Please try again.');
      return;
    }

    login(googleId).then(() => {
      navigate('/demo', { replace: true });
    });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-glow p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Failed</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-brand-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-600 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Connecting your Gmail...</h2>
        <p className="text-white/70 mt-2">Setting up real-time sync and AI features</p>
      </div>
    </div>
  );
}
