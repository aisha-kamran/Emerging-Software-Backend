import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

// ✅ New User Type Definition (Matches Backend)
export interface User {
  id: number;
  username: string;
  is_super_admin: boolean;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Check Auth on Load (Reload hone par user gayab na ho)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user_data');
      
      if (token && savedUser) {
        try {
            // Verify if token is still valid by fetching fresh data
            // (Optional: You can skip this call to save bandwidth)
            setUser(JSON.parse(savedUser));
        } catch (error) {
            console.error("Session expired");
            logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // 2. Login Function
  const login = async (username: string, password: string) => {
    try {
      // Step A: Get Token from Backend
      const { access_token } = await api.login(username, password);
      localStorage.setItem('token', access_token);

      // Step B: Fetch User Details (Kyunki Login API sirf token deti hai)
      // Hum admin list mangwa kar current user ko dhoondenge
      const admins = await api.fetchAdmins();
      const currentUser = admins.find((u: any) => u.username === username);

      if (!currentUser) {
        throw new Error('User found but details missing');
      }

      // Step C: Create User Object
      const userData: User = {
        id: currentUser.id,
        username: currentUser.username,
        is_super_admin: currentUser.is_super_admin,
        token: access_token
      };

      // Step D: Save & Set State
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      return true;

    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // 3. Logout Function
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