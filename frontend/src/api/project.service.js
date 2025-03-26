import api from './axios';

/**
 * Service for project-related API calls
 */
const ProjectService = {
  /**
   * Get all projects
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise} - API response
   */
  getAllProjects: async (params = {}) => {
    return api.get('/projects', { params });
  },

  /**
   * Get a project by ID
   * @param {String} id - Project ID
   * @returns {Promise} - API response
   */
  getProjectById: async (id) => {
    return api.get(`/projects/${id}`);
  },

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @returns {Promise} - API response
   */
  createProject: async (projectData) => {
    return api.post('/projects', projectData);
  },

  /**
   * Update a project
   * @param {String} id - Project ID
   * @param {Object} projectData - Updated project data
   * @returns {Promise} - API response
   */
  updateProject: async (id, projectData) => {
    return api.patch(`/projects/${id}`, projectData);
  },

  /**
   * Delete a project
   * @param {String} id - Project ID
   * @returns {Promise} - API response
   */
  deleteProject: async (id) => {
    return api.delete(`/projects/${id}`);
  },

  /**
   * Add a member to a project
   * @param {String} projectId - Project ID
   * @param {String} userId - User ID to add
   * @returns {Promise} - API response
   */
  addProjectMember: async (projectId, userId) => {
    return api.post(`/projects/${projectId}/members`, { userId });
  },

  /**
   * Remove a member from a project
   * @param {String} projectId - Project ID
   * @param {String} userId - User ID to remove
   * @returns {Promise} - API response
   */
  removeProjectMember: async (projectId, userId) => {
    return api.delete(`/projects/${projectId}/members/${userId}`);
  },

  /**
   * Get project statistics
   * @param {String} id - Project ID
   * @returns {Promise} - API response
   */
  getProjectStats: async (id) => {
    return api.get(`/projects/${id}/stats`);
  }
};

export default ProjectService;
