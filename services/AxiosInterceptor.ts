import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { StorageKeys } from '@/constants/Storage';

/**
 * AxiosInterceptor - Simplified JWT Token Management
 *
 * This module implements a simplified Interceptor Pattern for HTTP requests using Axios.
 * It only handles adding authorization headers to requests.
 *
 * Token refresh is handled entirely by AuthContext to avoid duplication and conflicts.
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
 * PURPOSE OF THIS SIMPLIFIED AXIOS INTERCEPTOR
 * ============================================
 * This interceptor provides only:
 *
 * 1. REQUEST INTERCEPTOR:
 *    - Automatically adds Authorization headers to all outgoing requests
 *    - Eliminates the need to manually include tokens in each API call
 *
 * Token refresh and authentication state management is handled by AuthContext:
 * - Proactive token refresh every 15 minutes
 * - Reactive token refresh when needed
 * - Proper logout handling when tokens are invalid
 * - State management for React components
 *
 * BENEFITS
 * ========
 * - Single source of truth for authentication (AuthContext)
 * - No conflicts between interceptor and context
 * - Simpler, more predictable behavior
 * - 401 errors bubble up naturally to trigger proper logout
 * - Centralized authentication logic
 *
 * USAGE
 * =====
 * Simply import this module instead of axios directly:
 * ```typescript
 * import axios from './AxiosInterceptor';
 * // All axios calls now have automatic auth headers
 * ```
 */

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
 * Simple pass-through response interceptor for potential future use.
 * Token refresh is handled by AuthContext, not here.
 */
axios.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Let all errors (including 401s) bubble up naturally
    // AuthContext handles token refresh and logout logic
    return Promise.reject(error);
  },
);

/**
 * Export the configured axios instance with interceptors.
 * Use this instead of importing axios directly to get automatic auth headers.
 */
export default axios;
