const express = require('express');
const projectController = require('../controllers/project.controller');
const { protect, isOwnerOrAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Project routes
router.route('/')
  .get(projectController.getAllProjects)
  .post(projectController.createProject);

router.route('/:id')
  .get(projectController.getProjectById)
  .patch(isOwnerOrAdmin('project'), projectController.updateProject)
  .delete(isOwnerOrAdmin('project'), projectController.deleteProject);

// Project members routes
router.post('/:id/members', isOwnerOrAdmin('project'), projectController.addProjectMember);
router.delete('/:id/members/:userId', isOwnerOrAdmin('project'), projectController.removeProjectMember);

// Project statistics
router.get('/:id/stats', projectController.getProjectStats);

module.exports = router;
