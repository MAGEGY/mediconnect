import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { User } from '@/types';
import { storage } from '@/utils/storage';
import { userService } from '@/utils/data';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'approvalStatus'>, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      await userService.createTestUsers();
    } catch (error) {
      console.error('Error creating test users:', error);
    }
    await loadUser();
  };

  const loadUser = async () => {
    try {
      const savedUser = await storage.getUser();
      setUser(savedUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const authenticatedUser = await userService.authenticate(username, password);
      
      if (!authenticatedUser) {
        return false;
      }

      if (authenticatedUser.approvalStatus !== 'approved') {
        return false;
      }

      await storage.setUser(authenticatedUser);
      setUser(authenticatedUser);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'approvalStatus'>, password: string): Promise<boolean> => {
    try {
      await userService.create(userData, password);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    await storage.removeUser();
    setUser(null);
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return false;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access MedRecord',
        fallbackLabel: 'Use passcode',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, authenticateWithBiometric }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
