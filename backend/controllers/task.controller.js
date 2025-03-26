const Task = require('../models/task.model');
const Project = require('../models/project.model');

/**
 * Get all tasks
 * @route GET /api/tasks
 * @access Private
 */
exports.getAllTasks = async (req, res) => {
  try {
    // Build query based on user role and filters
    let query;
    
    if (req.user.role === 'admin') {
      // Admins can see all tasks
      query = Task.find();
    } else {
      // Regular users can only see tasks they created or are assigned to
      // or tasks from projects they are members of
      const userProjects = await Project.find({
        $or: [
          { owner: req.user._id },
          { members: req.user._id }
        ]
      }).select('_id');
      
      const projectIds = userProjects.map(project => project._id);
      
      query = Task.find({
        $or: [
          { createdBy: req.user._id },
          { assignedTo: req.user._id },
          { project: { $in: projectIds } }
        ]
      });
    }
    
    // Filter by project if specified
    if (req.query.project) {
      query = query.find({ project: req.query.project });
    }
    
    // Advanced filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'project'];
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
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    
    query = query.skip(skip).limit(limit);
    
    // Execute query
    const tasks = await query;
    
    // Send response
    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: {
        tasks
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
 * Get task by ID
 * @route GET /api/tasks/:id
 * @access Private
 */
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate({
        path: 'project',
        select: 'name owner members'
      });
    
    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found'
      });
    }
    
    // Check if user has access to this task
    if (
      req.user.role !== 'admin' && 
      !task.createdBy.equals(req.user._id) && 
      !task.assignedTo?.equals(req.user._id) &&
      !task.project.owner.equals(req.user._id) &&
      !task.project.members.some(member => member.equals(req.user._id))
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to access this task'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        task
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
 * Create new task
 * @route POST /api/tasks
 * @access Private
 */
exports.createTask = async (req, res) => {
  try {
    // Set the current user as the creator
    req.body.createdBy = req.user._id;
    
    // Check if project exists and user has access to it
    const project = await Project.findById(req.body.project);
    
    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'Project not found'
      });
    }
    
    // Check if user has permission to create tasks in this project
    if (
      req.user.role !== 'admin' && 
      !project.owner.equals(req.user._id) && 
      !project.members.some(member => member._id.equals(req.user._id))
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to create tasks in this project'
      });
    }
    
    const newTask = await Task.create(req.body);
    
    // Update project completion percentage
    await project.calculateCompletionPercentage();
    
    res.status(201).json({
      status: 'success',
      data: {
        task: newTask
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
 * Update task
 * @route PATCH /api/tasks/:id
 * @access Private
 */
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate({
        path: 'project',
        select: 'owner members'
      });
    
    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found'
      });
    }
    
    // Check if user has permission to update this task
    if (
      req.user.role !== 'admin' && 
      !task.createdBy.equals(req.user._id) && 
      !task.assignedTo?.equals(req.user._id) &&
      !task.project.owner.equals(req.user._id)
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this task'
      });
    }
    
    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    // Update project completion percentage
    const project = await Project.findById(task.project._id);
    await project.calculateCompletionPercentage();
    
    res.status(200).json({
      status: 'success',
      data: {
        task: updatedTask
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
 * Delete task
 * @route DELETE /api/tasks/:id
 * @access Private
 */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate({
        path: 'project',
        select: 'owner'
      });
    
    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found'
      });
    }
    
    // Check if user has permission to delete this task
    if (
      req.user.role !== 'admin' && 
      !task.createdBy.equals(req.user._id) && 
      !task.project.owner.equals(req.user._id)
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete this task'
      });
    }
    
    // Store project ID before deleting task
    const projectId = task.project._id;
    
    // Delete the task
    await Task.findByIdAndDelete(req.params.id);
    
    // Update project completion percentage
    const project = await Project.findById(projectId);
    await project.calculateCompletionPercentage();
    
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
 * Add comment to task
 * @route POST /api/tasks/:id/comments
 * @access Private
 */
exports.addTaskComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        status: 'fail',
        message: 'Comment text is required'
      });
    }
    
    const task = await Task.findById(req.params.id)
      .populate({
        path: 'project',
        select: 'owner members'
      });
    
    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found'
      });
    }
    
    // Check if user has permission to comment on this task
    if (
      req.user.role !== 'admin' && 
      !task.createdBy.equals(req.user._id) && 
      !task.assignedTo?.equals(req.user._id) &&
      !task.project.owner.equals(req.user._id) &&
      !task.project.members.some(member => member.equals(req.user._id))
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to comment on this task'
      });
    }
    
    // Add comment to task
    task.comments.push({
      text,
      createdBy: req.user._id
    });
    
    await task.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        task
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
 * Get tasks assigned to current user
 * @route GET /api/tasks/my-tasks
 * @access Private
 */
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate({
        path: 'project',
        select: 'name'
      });
    
    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: {
        tasks
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
