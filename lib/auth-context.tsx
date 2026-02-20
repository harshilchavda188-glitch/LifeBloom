import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function hashPassword(password: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return digest;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const stored = await AsyncStorage.getItem('currentUser');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load user:', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      const usersStr = await AsyncStorage.getItem('users');
      const users: Array<User & { passwordHash: string }> = usersStr ? JSON.parse(usersStr) : [];
      const hash = await hashPassword(password);
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === hash);
      if (!found) {
        return { success: false, error: 'Invalid email or password' };
      }
      const userData: User = { id: found.id, name: found.name, email: found.email };
      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      const usersStr = await AsyncStorage.getItem('users');
      const users: Array<User & { passwordHash: string }> = usersStr ? JSON.parse(usersStr) : [];
      const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return { success: false, error: 'An account with this email already exists' };
      }
      const hash = await hashPassword(password);
      const id = Crypto.randomUUID();
      const newUser = { id, name, email, passwordHash: hash };
      users.push(newUser);
      await AsyncStorage.setItem('users', JSON.stringify(users));
      const userData: User = { id, name, email };
      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  async function logout() {
    await AsyncStorage.removeItem('currentUser');
    setUser(null);
  }

  const value = useMemo(() => ({
    user,
    isLoading,
    login,
    register,
    logout,
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
