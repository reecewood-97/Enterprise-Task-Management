import api from './axios';

/**
 * Service for task-related API calls
 */
const TaskService = {
  /**
   * Get all tasks
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise} - API response
   */
  getAllTasks: async (params = {}) => {
    return api.get('/tasks', { params });
  },

  /**
   * Get a task by ID
   * @param {String} id - Task ID
   * @returns {Promise} - API response
   */
  getTaskById: async (id) => {
    return api.get(`/tasks/${id}`);
  },

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Promise} - API response
   */
  createTask: async (taskData) => {
    return api.post('/tasks', taskData);
  },

  /**
   * Update a task
   * @param {String} id - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise} - API response
   */
  updateTask: async (id, taskData) => {
    return api.patch(`/tasks/${id}`, taskData);
  },

  /**
   * Delete a task
   * @param {String} id - Task ID
   * @returns {Promise} - API response
   */
  deleteTask: async (id) => {
    return api.delete(`/tasks/${id}`);
  },

  /**
   * Add a comment to a task
   * @param {String} taskId - Task ID
   * @param {String} text - Comment text
   * @returns {Promise} - API response
   */
  addTaskComment: async (taskId, text) => {
    return api.post(`/tasks/${taskId}/comments`, { text });
  },

  /**
   * Get tasks assigned to the current user
   * @returns {Promise} - API response
   */
  getMyTasks: async () => {
    return api.get('/tasks/my-tasks');
  },

  /**
   * Get tasks for a specific project
   * @param {String} projectId - Project ID
   * @returns {Promise} - API response
   */
  getTasksByProject: async (projectId) => {
    return api.get('/tasks', { params: { project: projectId } });
  }
};

export default TaskService;
