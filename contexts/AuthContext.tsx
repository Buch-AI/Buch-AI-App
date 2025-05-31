import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { StorageKeys } from '@/constants/Storage';
import { getCurrentUser, login as authAdapterLogin } from '@/services/AuthAdapter';
import Logger from '@/utils/Logger';
import { ThemedModal } from '@/components/ui-custom/ThemedModal';

interface AuthContextType {
  isAuthenticated: boolean;
  jsonWebToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setAuthenticated: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [jsonWebToken, setJsonWebToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(StorageKeys.AUTH_JWT);
        if (storedToken) {
          try {
            await getCurrentUser(storedToken);
            setJsonWebToken(storedToken);
            setIsAuthenticated(true);
          } catch (error) {
            Logger.error(`Token validation failed: ${error}`);
            await AsyncStorage.removeItem(StorageKeys.AUTH_JWT);
            setJsonWebToken(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        Logger.error(`Error loading auth token: ${error}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tokenResponse = await authAdapterLogin(email, password);
      const newToken = tokenResponse.access_token;

      if (newToken) {
        await AsyncStorage.setItem(StorageKeys.AUTH_JWT, newToken);
        setJsonWebToken(newToken);
        setIsAuthenticated(true);
        
        // NOTE: Keep isLoading true through the transition
        // NOTE: It will be set to false in _layout.tsx after navigation
      } else {
        throw new Error('No token received');
      }
    } catch (error: any) {
      Logger.error(`Login failed: ${error}`);
      setError(error.message || 'An error occurred during login.');
      
      // Terminate loading state on error
      setIsLoading(false);
      
      throw error;
    }
    // NOTE: We're not setting isLoading to false in the finally block because we want to keep the loading state active during navigation
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem(StorageKeys.AUTH_JWT);
      setJsonWebToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      Logger.error(`Sign-out failed: ${error}`);
      setError(`Sign-out failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const setAuthenticated = (value: boolean) => {
    setIsAuthenticated(value);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        jsonWebToken,
        isLoading,
        error,
        login,
        signOut,
        setAuthenticated,
        setIsLoading,
        setError,
      }}
    >
      {children}
      <ThemedModal
        visible={!!error}
        onClose={() => setError(null)}
        title="Error"
        message={error || ''}
      />
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