import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const API_URL = 'https://coffe-subcription-3w.onrender.com/api';

interface AuthContextValue {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('user').then((stored) => {
      if (stored) {
        try {
          const obj = JSON.parse(stored);
          setToken(obj.token);
        } catch {
          // ignore
        }
      }
    });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      throw new Error('Login failed');
    }
    const json = await res.json();
    const token = json.data?.token as string;
    setToken(token);
    await AsyncStorage.setItem('user', JSON.stringify({ email, token }));
  };

  const logout = async () => {
    setToken(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

