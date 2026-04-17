import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuthStatus } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [googleId, setGoogleId] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check if we have a stored googleId
  useEffect(() => {
    const storedId = localStorage.getItem('googleId');
    if (storedId) {
      verifyAndLoad(storedId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyAndLoad = async (id) => {
    try {
      const res = await getAuthStatus(id);
      if (res.data.connected) {
        setGoogleId(id);
        setUser({ email: res.data.email, profileImage: res.data.profileImage });
        localStorage.setItem('googleId', id);
      } else {
        localStorage.removeItem('googleId');
      }
    } catch {
      localStorage.removeItem('googleId');
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (id) => {
    setIsLoading(true);
    await verifyAndLoad(id);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('googleId');
    setGoogleId(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ googleId, user, isAuthenticated: !!googleId, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
