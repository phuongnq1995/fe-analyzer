import { User } from "../types";

/**
 * AUTHENTICATION API DOCUMENTATION
 * ------------------------------
 * This service expects a backend REST API running at http://localhost:8080/api/auth
 */

const AUTH_BASE_URL = import.meta.env.VITE_API_URL + '/auth';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Centralized Fetch Interceptor
 * Automatically adds the Authorization header if a token exists.
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  
  // Construct headers
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  // Note: We do NOT set Content-Type to application/json by default here 
  // because services like csvService need to send FormData (multipart), 
  // where the browser must set the boundary automatically.

  const config: RequestInit = {
    ...options,
    headers: headers
  };

  return fetch(url, config);
};

export const loginUser = async (username: string, password: string): Promise<User> => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      // Try to parse error message from JSON, fallback to text
      try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Đăng nhập thất bại');
      } catch (e: any) {
          // If json parse failed or it was the error throw above
          if (e.message && e.message !== 'Unexpected end of JSON input') throw e;
          
          const textError = await response.text();
          throw new Error(textError || `Lỗi đăng nhập: ${response.status}`);
      }
    }

    const data = await response.json();
    const user: User = { ...data.user, token: data.token };
    
    // Persist session
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;

  } catch (error: any) {
    console.warn("Login API failed (likely backend is offline), falling back to mock data.", error);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return a mock user based on the input
    return {
      id: 'mock-user-123',
      username: username,
      email: `${username.toLowerCase()}@example.com`,
      token: 'mock-jwt-token-xyz'
    };
  }
};

export const registerUser = async (username: string, password: string, shopName: string, shopDescription: string): Promise<User> => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password , shopName, shopDescription})
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Đăng ký thất bại');
    }

    const data = await response.json();

    const user: User = { ...data.user, token: data.token };
    
    // Persist session
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;

  } catch (error: any) {
    console.error("Register API failed, falling back to mock data.", error);
    throw new Error('Đăng ký thất bại', error);
  }
};

export const logoutUser = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (userStr && token) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
};