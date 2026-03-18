/**
 * Advanced Auth Storage Utility
 * Handles token and user data persistence using localStorage (persistent) 
 * or sessionStorage (temporary) based on user preference.
 */

const TOKEN_KEY = 'token';
const USER_KEY = 'userData';

export const authStorage = {
  /**
   * Saves authentication data.
   * @param {string} token 
   * @param {object} user 
   * @param {boolean} rememberMe 
   */
  saveAuth: (token, user, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    // Always clear both first to avoid ghost data in the other storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

    if (token) storage.setItem(TOKEN_KEY, token);
    if (user) storage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Retrieves the access token from any available storage.
   * Checked in order of priority: localStorage then sessionStorage.
   */
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  /**
   * Retrieves the user data from any available storage.
   */
  getUser: () => {
    const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error("AuthStorage: Failed to parse user data", e);
      return null;
    }
  },

  /**
   * Updates user data while keeping the current storage strategy.
   */
  updateUser: (user) => {
    if (localStorage.getItem(USER_KEY)) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else if (sessionStorage.getItem(USER_KEY)) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  /**
   * Clears all authentication data from all storages.
   */
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    
    // Also clear API caches if they exist (consistent with current logic)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('api_cache_')) localStorage.removeItem(key);
    });
  }
};
