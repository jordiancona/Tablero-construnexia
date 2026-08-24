import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogleToken: (idToken: string) => Promise<void>;
  loginWithDemo: (email: string, name: string, avatar?: string) => Promise<void>;
  logout: () => void;
}

const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL || '') + '/api';

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  loginWithGoogleToken: async () => {},
  loginWithDemo: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('tablero_auth_token');
    const savedUser = localStorage.getItem('tablero_auth_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch {
        localStorage.removeItem('tablero_auth_token');
        localStorage.removeItem('tablero_auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const loginWithGoogleToken = async (idToken: string) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/google`, { idToken });
      const { token: jwtToken, user: userData } = res.data;

      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('tablero_auth_token', jwtToken);
      localStorage.setItem('tablero_auth_user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  };

  const loginWithDemo = async (email: string, name: string, avatar?: string) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/google`, {
        demoUser: { email, name, avatar },
      });
      const { token: jwtToken, user: userData } = res.data;

      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('tablero_auth_token', jwtToken);
      localStorage.setItem('tablero_auth_user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    } catch (error) {
      console.error('Error en login demo:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tablero_auth_token');
    localStorage.removeItem('tablero_auth_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        loginWithGoogleToken,
        loginWithDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
