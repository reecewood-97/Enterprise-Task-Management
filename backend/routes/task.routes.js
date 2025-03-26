const express = require('express');
const taskController = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get tasks assigned to current user
router.get('/my-tasks', taskController.getMyTasks);

// Task routes
router.route('/')
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

router.route('/:id')
  .get(taskController.getTaskById)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

// Task comments
router.post('/:id/comments', taskController.addTaskComment);

module.exports = router;
