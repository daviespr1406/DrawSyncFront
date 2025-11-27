/**
 * Authentication service for managing JWT tokens
 * Handles token storage, retrieval, and authentication state
 */

const TOKEN_KEY = 'drawsync_auth_token';
const USER_KEY = 'drawsync_user';

export interface AuthToken {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export interface User {
  username: string;
  email?: string;
}

/**
 * Save authentication token to localStorage
 */
export const saveToken = (token: AuthToken): void => {
  console.log('Saving token:', token); // Debug log
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
};

/**
 * Get authentication token from localStorage
 */
export const getToken = (): AuthToken | null => {
  const tokenStr = localStorage.getItem(TOKEN_KEY);
  console.log('getToken - raw string:', tokenStr ? 'Found' : 'Null'); // Debug log
  if (!tokenStr) return null;

  try {
    const token = JSON.parse(tokenStr) as AuthToken;
    console.log('getToken - parsed object:', token); // Debug log
    return token;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Get the access token string for API requests
 */
export const getAccessToken = (): string | null => {
  const token = getToken();
  return token?.access_token || null;
};

/**
 * Remove authentication token from localStorage
 */
export const removeToken = (): void => {
  console.log('Removing token'); // Debug log
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  const hasToken = token !== null;
  const hasAccessToken = token?.access_token !== undefined && token?.access_token !== null;

  console.log('isAuthenticated check details:', {
    hasToken,
    hasAccessToken,
    tokenKeys: token ? Object.keys(token) : []
  });

  return hasToken && hasAccessToken;
};

/**
 * Save user information
 */
export const saveUser = (user: User): void => {
  console.log('Saving user:', user); // Debug log
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Get user information
 */
export const getUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('Error parsing user:', error);
    return null;
  }
};

/**
 * Create authorization headers for API requests
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = getAccessToken();

  if (!token) {
    return {
      'Content-Type': 'application/json',
    };
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Logout user - clear all auth data
 */
export const logout = (): void => {
  removeToken();
  // Optionally, you can redirect manually when needed
  // window.location.href = '/';
};
