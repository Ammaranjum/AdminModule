import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Admin } from '../types';
import { getCurrentAdmin, loginAdmin, logoutAdmin } from '../services/supabase';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentAdmin = await getCurrentAdmin();
        setAdmin(currentAdmin);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await loginAdmin(email, password);
      const currentAdmin = await getCurrentAdmin();
      setAdmin(currentAdmin);
      toast.success('Logged in successfully');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await logoutAdmin();
      setAdmin(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};