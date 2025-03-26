const Project = require('../models/project.model');
const Task = require('../models/task.model');

/**
 * Get all projects
 * @route GET /api/projects
 * @access Private
 */
exports.getAllProjects = async (req, res) => {
  try {
    // Build query based on user role
    let query;
    
    if (req.user.role === 'admin') {
      // Admins can see all projects
      query = Project.find();
    } else {
      // Regular users can only see projects they own or are members of
      query = Project.find({
        $or: [
          { owner: req.user._id },
          { members: req.user._id }
        ]
      });
    }
    
    // Advanced filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
    
    query = query.find(JSON.parse(queryStr));
    
    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    query = query.skip(skip).limit(limit);
    
    // Execute query
    const projects = await query;
    
    // Send response
    res.status(200).json({
      status: 'success',
      results: projects.length,
      data: {
        projects
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Get project by ID
 * @route GET /api/projects/:id
 * @access Private
 */
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'Project not found'
      });
    }
    
    // Check if user has access to this project
    if (
      req.user.role !== 'admin' && 
      !project.owner.equals(req.user._id) && 
      !project.members.some(member => member.equals(req.user._id))
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to access this project'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Create new project
 * @route POST /api/projects
 * @access Private
 */
exports.createProject = async (req, res) => {
  try {
    // Set the current user as the owner
    req.body.owner = req.user._id;
    
    // Add owner to members list if not already included
    if (!req.body.members) {
      req.body.members = [req.user._id];
    } else if (!req.body.members.includes(req.user._id.toString())) {
      req.body.members.push(req.user._id);
    }
    
    const newProject = await Project.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        project: newProject
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

/**
 * Update project
 * @route PATCH /api/projects/:id
 * @access Private
 */
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'Project not found'
      });
    }
    
    // Check if user has permission to update this project
    if (
      req.user.role !== 'admin' && 
      !project.owner.equals(req.user._id)
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this project'
      });
    }
    
    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        project: updatedProject
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

/**
 * Delete project
 * @route DELETE /api/projects/:id
 * @access Private
 */
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'Project not found'
      });
    }
    
    // Check if user has permission to delete this project
    if (
      req.user.role !== 'admin' && 
      !project.owner.equals(req.user._id)
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete this project'
      });
    }
    
    // Delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id });
    
    // Delete the project
    await Project.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Add member to project
 * @route POST /api/projects/:id/members
 * @access Private
 */
exports.addProjectMember = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a user ID'
      });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'Project not found'
      });
    }
    
    // Check if user has permission to add members
    if (
      req.user.role !== 'admin' && 
      !project.owner.equals(req.user._id)
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to add members to this project'
      });
    }
    
    // Check if user is already a member
    if (project.members.some(member => member._id.toString() === userId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'User is already a member of this project'
      });
    }
    
    // Add member to project
    project.members.push(userId);
    await project.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

/**
 * Remove member from project
 * @route DELETE /api/projects/:id/members/:userId
 * @access Private
 */
exports.removeProjectMember = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'Project not found'
      });
    }
    
    // Check if user has permission to remove members
    if (
      req.user.role !== 'admin' && 
      !project.owner.equals(req.user._id)
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to remove members from this project'
      });
    }
    
    // Cannot remove the owner
    if (project.owner._id.toString() === userId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot remove the project owner'
      });
    }
    
    // Remove member from project
    project.members = project.members.filter(
      member => member._id.toString() !== userId
    );
    
    await project.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

/**
 * Get project statistics
 * @route GET /api/projects/:id/stats
 * @access Private
 */
exports.getProjectStats = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'Project not found'
      });
    }
    
    // Check if user has access to this project
    if (
      req.user.role !== 'admin' && 
      !project.owner.equals(req.user._id) && 
      !project.members.some(member => member.equals(req.user._id))
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to access this project'
      });
    }
    
    // Get task statistics
    const taskStats = await Task.aggregate([
      {
        $match: { project: project._id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format statistics
    const stats = {
      totalTasks: 0,
      tasksByStatus: {}
    };
    
    taskStats.forEach(stat => {
      stats.tasksByStatus[stat._id] = stat.count;
      stats.totalTasks += stat.count;
    });
    
    // Get completion percentage
    stats.completionPercentage = project.completionPercentage;
    
    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
