import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, businessName: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setAuthState({ user, isAuthenticated: true });
    }
  }, []);

  const register = async (name: string, email: string, password: string, businessName: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      if (users.find((u: User) => u.email === email)) {
        return false; // Email already exists
      }

      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        businessName,
        createdAt: new Date().toISOString(),
      };

      users.push({ ...newUser, password });
      localStorage.setItem('users', JSON.stringify(users));
      
      setAuthState({ user: newUser, isAuthenticated: true });
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        setAuthState({ user: userWithoutPassword, isAuthenticated: true });
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setAuthState({ user: null, isAuthenticated: false });
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};