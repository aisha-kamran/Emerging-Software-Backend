import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, login as doLogin, logout as doLogout, initializeStorage, addUser } from '@/lib/storage';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<User | null>;
  logout: () => void;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize storage with default data
    initializeStorage();
    
    // Check for existing session
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (emailOrUsername: string, password: string): Promise<User | null> => {
    // Try backend login first (username expected). If user provided an email, derive username part
    const username = emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername;
    try {
      const tokenResp = await api.adminLogin(username, password);
      api.saveToken(tokenResp.access_token);

      // Try to fetch admins and map to local User shape
      try {
        const admins = await api.fetchAdmins();
        const match = admins.find((a: any) => a.username === username);
        if (match) {
          const newUser: User = {
            id: String(match.id),
            email: `${match.username}@admin.com`,
            name: match.username,
            role: match.is_super_admin ? 'superadmin' : 'admin',
            createdAt: match.created_at || new Date().toISOString(),
          };
          // Persist session in sessionStorage for compatibility with rest of app
          sessionStorage.setItem('currentUser', JSON.stringify(newUser));
          setUser(newUser);
          return newUser;
        }
      } catch (e) {
        // ignore fetchAdmins errors, fall back to local demo login below
      }

      // If we couldn't map admin, create a minimal user entry
      const fallbackUser: User = {
        id: `admin-${Date.now()}`,
        email: `${username}@admin.com`,
        name: username,
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      sessionStorage.setItem('currentUser', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      return fallbackUser;
    } catch (e) {
      // Backend login failed; fall back to local demo auth
      const loggedInUser = doLogin(emailOrUsername, password);
      setUser(loggedInUser);
      return loggedInUser;
    }
  };

  const logout = () => {
    doLogout();
    setUser(null);
  };

  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isSuperAdmin }}>
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
