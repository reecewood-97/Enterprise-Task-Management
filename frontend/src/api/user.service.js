import api from './axios';

/**
 * Service for user-related API calls
 */
const UserService = {
  /**
   * Get all users (admin only)
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise} - API response
   */
  getAllUsers: async (params = {}) => {
    return api.get('/users', { params });
  },

  /**
   * Get a user by ID (admin only)
   * @param {String} id - User ID
   * @returns {Promise} - API response
   */
  getUserById: async (id) => {
    return api.get(`/users/${id}`);
  },

  /**
   * Create a new user (admin only)
   * @param {Object} userData - User data
   * @returns {Promise} - API response
   */
  createUser: async (userData) => {
    return api.post('/users', userData);
  },

  /**
   * Update a user (admin only)
   * @param {String} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} - API response
   */
  updateUser: async (id, userData) => {
    return api.patch(`/users/${id}`, userData);
  },

  /**
   * Delete a user (admin only)
   * @param {String} id - User ID
   * @returns {Promise} - API response
   */
  deleteUser: async (id) => {
    return api.delete(`/users/${id}`);
  },

  /**
   * Update current user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise} - API response
   */
  updateProfile: async (userData) => {
    return api.patch('/users/update-me', userData);
  },

  /**
   * Delete current user account
   * @returns {Promise} - API response
   */
  deleteAccount: async () => {
    return api.delete('/users/delete-me');
  }
};

export default UserService;
