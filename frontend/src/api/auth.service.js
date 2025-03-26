import api from './axios';

/**
 * Service for authentication-related API calls
 */
const AuthService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - API response
   */
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  /**
   * Login a user
   * @param {Object} credentials - User login credentials
   * @returns {Promise} - API response
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response;
  },

  /**
   * Logout the current user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get the current logged in user
   * @returns {Promise} - API response
   */
  getCurrentUser: async () => {
    return api.get('/auth/me');
  },

  /**
   * Update user password
   * @param {Object} passwordData - Password update data
   * @returns {Promise} - API response
   */
  updatePassword: async (passwordData) => {
    return api.patch('/auth/update-password', passwordData);
  },

  /**
   * Check if a user is authenticated
   * @returns {Boolean} - True if authenticated, false otherwise
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  /**
   * Get the current user from local storage
   * @returns {Object|null} - User object or null
   */
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default AuthService;
