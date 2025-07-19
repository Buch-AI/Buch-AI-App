import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemedModal } from '@/components/ui-custom/ThemedModal';
import { StorageKeys } from '@/constants/Storage';
import { getCurrentUser, login as authAdapterLogin, refreshToken as authAdapterRefreshToken } from '@/services/AuthAdapter';
import Logger from '@/utils/Logger';

interface AuthContextType {
  isAuthenticated: boolean;
  jsonWebToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  refreshTokenIfNeeded: () => Promise<string | null>;
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

            // Attempt to refresh the token before logging out
            const refreshedToken = await refreshTokenIfNeeded();
            if (!refreshedToken) {
              // If refresh failed, clear everything
              await AsyncStorage.removeItem(StorageKeys.AUTH_JWT);
              setJsonWebToken(null);
              setIsAuthenticated(false);
            }
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

  // Proactive token refresh every 15 minutes
  useEffect(() => {
    if (!isAuthenticated) {
      return; // Don't set up interval if user is not authenticated
    }

    Logger.info('Setting up proactive token refresh interval (15 minutes)...');

    const interval = setInterval(async () => {
      try {
        Logger.info('Proactive token refresh triggered');
        await refreshTokenIfNeeded();
      } catch (error) {
        Logger.error(`Proactive token refresh failed: ${error}`);
        // Don't logout on proactive refresh failure - let reactive refresh handle it
      }
    }, 15 * 60 * 1000); // 15 minutes in milliseconds

    // Cleanup interval when component unmounts or authentication state changes
    return () => {
      Logger.info('Clearing proactive token refresh interval...');
      clearInterval(interval);
    };
  }, [isAuthenticated]); // Re-run when authentication state changes

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

  // Function to attempt token refresh before logging out
  const refreshTokenIfNeeded = async (): Promise<string | null> => {
    const currentToken = jsonWebToken || await AsyncStorage.getItem(StorageKeys.AUTH_JWT);

    if (!currentToken) {
      return null;
    }

    try {
      Logger.info('Attempting token refresh...');
      const tokenResponse = await authAdapterRefreshToken(currentToken);
      const newToken = tokenResponse.access_token;

      if (newToken) {
        await AsyncStorage.setItem(StorageKeys.AUTH_JWT, newToken);
        setJsonWebToken(newToken);
        setIsAuthenticated(true);
        Logger.info('Token refreshed successfully');
        return newToken;
      }
    } catch (error) {
      Logger.error(`Token refresh failed: ${error}`);
      // If refresh fails, clear the token and log out
      await AsyncStorage.removeItem(StorageKeys.AUTH_JWT);
      setJsonWebToken(null);
      setIsAuthenticated(false);
    }

    return null;
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
        refreshTokenIfNeeded,
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
