import axios from 'axios';
import { BUCHAI_SERVER_URL } from '@/constants/Config';
import Logger from '@/utils/Logger';

// Interface for the login request body
interface LoginRequest {
  grant_type: 'password';
  username: string;
  password: string;
}

// Interface for the token response
interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Interface for the user information
interface User {
  username: string;
  email?: string | null;
  full_name?: string | null;
  disabled?: boolean | null;
}

// Function to log in and retrieve an access token
export async function login(username: string, password: string): Promise<TokenResponse> {
  // Create a request body that conforms to the LoginRequest interface
  const requestBody: LoginRequest = {
    grant_type: 'password',
    username,
    password,
  };

  // Convert the request body to URL-encoded format
  const formBody = new URLSearchParams({
    grant_type: requestBody.grant_type,
    username: requestBody.username,
    password: requestBody.password,
  }).toString();

  try {
    const response = await axios.post(`${BUCHAI_SERVER_URL}/auth/token`, formBody, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // Set the content type
      },
    });
    Logger.info(`Login successful: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      Logger.error(`Login failed: ${JSON.stringify(error.response.data)}`);
    } else {
      Logger.error(`Login failed: ${error}`);
    }
    throw error; // Rethrow the error for handling in the component
  }
}

// Function to get the current user's information
export async function getCurrentUser(token: string): Promise<User> {
  try {
    const response = await axios.get(`${BUCHAI_SERVER_URL}/auth/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    Logger.info(`Retrieved user information: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error: any) {
    Logger.error(`Failed to retrieve user information: ${error}`);
    throw error; // Rethrow the error for handling in the component
  }
}

// Function to get the current user's items
export async function getCurrentUserItems(token: string): Promise<any> {
  try {
    const response = await axios.get(`${BUCHAI_SERVER_URL}/auth/users/items`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    Logger.info(`Retrieved user items: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error: any) {
    Logger.error(`Failed to retrieve user items: ${error}`);
    throw error; // Rethrow the error for handling in the component
  }
}
