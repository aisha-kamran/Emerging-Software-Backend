import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_super_admin: boolean;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user_data');
      
      if (token && savedUser) {
        try {
            setUser(JSON.parse(savedUser));
        } catch (error) {
            logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { access_token } = await api.login(email, password);
      localStorage.setItem('token', access_token);

      const admins = await api.fetchAdmins();
      const currentUser = admins.find((u: any) => u.email === email);

      if (!currentUser) {
        throw new Error('User details missing');
      }

      const userData: User = {
        id: currentUser.id,
        email: currentUser.email,
        full_name: currentUser.full_name,
        is_super_admin: currentUser.is_super_admin,
        token: access_token
      };

      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      return true;

    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout,
      isSuperAdmin: user?.is_super_admin || false 
    }}>
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