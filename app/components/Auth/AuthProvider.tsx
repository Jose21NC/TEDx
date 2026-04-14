'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import LoginForm from './LoginForm';

const AuthContext = createContext({ isLoggedIn: false, login: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem('admin_authenticated');
    if (savedSession === 'true') {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem('admin_authenticated', 'true');
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('admin_authenticated');
  };

  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-900 text-gray-400 font-mono">
      VERIFICANDO SESIÓN...
    </div>
  );

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {isLoggedIn ? children : <LoginForm onLoginSuccess={login} />}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);