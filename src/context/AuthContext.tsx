import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemUser } from '../types';
import { fetchCurrentUser, loginWithLinuxPam } from '../services/api';

interface AuthContextType {
  user: SystemUser | null;
  loading: boolean;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SystemUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const login = async (username: string, password?: string): Promise<boolean> => {
    const res = await loginWithLinuxPam(username, password);
    if (res.success && res.user) {
      setUser(res.user);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (user) {
      setUser({ ...user, isAuthenticated: false });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
