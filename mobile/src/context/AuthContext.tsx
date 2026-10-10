import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { User } from '../api/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = await api.getToken();
        if (savedToken) {
          setToken(savedToken);
          const meRes = await api.getMe();
          if (meRes.success && meRes.data) {
            setUser(meRes.data);
          } else {
            // Token expired or invalid
            await api.clearToken();
            setToken(null);
            setUser(null);
          }
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success && res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, error: res.error || 'Authentication failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login error' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await api.clearToken();
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  const refreshProfile = async () => {
    const meRes = await api.getMe();
    if (meRes.success && meRes.data) {
      setUser(meRes.data);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
