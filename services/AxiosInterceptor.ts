import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { StorageKeys } from '@/constants/Storage';
import { refreshToken } from '@/services/AuthAdapter';
import Logger from '@/utils/Logger';

/**
 * AxiosInterceptor - Automatic JWT Token Management
 *
 * This module implements the Interceptor Pattern for HTTP requests using Axios.
 * The Interceptor Pattern allows you to intercept and modify HTTP requests and responses
 * globally across your application without modifying individual API calls.
 *
 * WHAT IS THE INTERCEPTOR PATTERN?
 * ================================
 * The Interceptor Pattern is a behavioral design pattern that allows you to insert
 * middleware-like functionality into a chain of operations. In the context of HTTP clients,
 * interceptors can:
 * - Modify requests before they're sent (request interceptors)
 * - Process responses before they reach your application code (response interceptors)
 * - Handle errors globally
 * - Implement cross-cutting concerns like authentication, logging, and retry logic
 *
 * PURPOSE OF THIS AXIOS INTERCEPTOR
 * =================================
 * This specific interceptor implementation provides automatic JWT token management:
 *
 * 1. REQUEST INTERCEPTOR:
 *    - Automatically adds Authorization headers to all outgoing requests
 *    - Eliminates the need to manually include tokens in each API call
 *
 * 2. RESPONSE INTERCEPTOR:
 *    - Detects 401 Unauthorized responses (expired/invalid tokens)
 *    - Automatically attempts to refresh the JWT token
 *    - Retries the original request with the new token
 *    - Queues multiple simultaneous requests during token refresh
 *    - Logs users out if token refresh fails
 *
 * BENEFITS
 * ========
 * - Seamless user experience (no unexpected logouts)
 * - Centralized authentication logic
 * - Reduced boilerplate code in service adapters
 * - Automatic handling of token expiration across the entire app
 * - Prevents race conditions when multiple requests fail simultaneously
 *
 * USAGE
 * =====
 * Simply import this module instead of axios directly:
 * ```typescript
 * import axios from './AxiosInterceptor';
 * // All axios calls now have automatic token management
 * ```
 */

// Flag to prevent infinite refresh loops during concurrent requests
let isRefreshing = false;

// Queue to hold failed requests while token refresh is in progress
let failedQueue: {
  resolve: (value: any) => void;
  reject: (error: any) => void;
}[] = [];

/**
 * Processes all queued requests after token refresh completes.
 *
 * @param error - Error if token refresh failed, null if successful
 * @param token - New token if refresh succeeded, null if failed
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * REQUEST INTERCEPTOR
 *
 * Automatically adds the Authorization header with JWT token to all outgoing requests.
 * This eliminates the need to manually include the token in each API call.
 */
axios.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(StorageKeys.AUTH_JWT);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * RESPONSE INTERCEPTOR
 *
 * Handles 401 Unauthorized responses by automatically attempting to refresh
 * the JWT token and retrying the original request. This provides seamless
 * token renewal without user intervention.
 *
 * FLOW:
 * 1. Detect 401 error on any API response
 * 2. Check if token refresh is already in progress
 * 3. If refreshing, queue the request for later retry
 * 4. If not refreshing, attempt token refresh
 * 5. On successful refresh, retry original request and process queue
 * 6. On failed refresh, clear tokens and reject all queued requests
 */
axios.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized responses (expired/invalid tokens)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If token refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axios(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      // Mark request as retried and start refresh process
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentToken = await AsyncStorage.getItem(StorageKeys.AUTH_JWT);

        if (!currentToken) {
          throw new Error('No token available for refresh');
        }

        Logger.info('Attempting automatic token refresh due to 401 error');
        const tokenResponse = await refreshToken(currentToken);
        const newToken = tokenResponse.access_token;

        if (newToken) {
          // Store the new token
          await AsyncStorage.setItem(StorageKeys.AUTH_JWT, newToken);

          // Update the authorization header for the original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          // Process all queued requests with the new token
          processQueue(null, newToken);
          Logger.info('Token refreshed successfully via interceptor');

          // Retry the original request with new token
          return axios(originalRequest);
        } else {
          throw new Error('No new token received');
        }
      } catch (refreshError) {
        Logger.error(`Automatic token refresh failed: ${refreshError}`);

        // Clear invalid token and log out user
        await AsyncStorage.removeItem(StorageKeys.AUTH_JWT);
        processQueue(refreshError, null);

        // Reject the original request - this will trigger logout in AuthContext
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For non-401 errors, reject as normal
    return Promise.reject(error);
  },
);

/**
 * Export the configured axios instance with interceptors.
 * Use this instead of importing axios directly to get automatic token management.
 */
export default axios;
