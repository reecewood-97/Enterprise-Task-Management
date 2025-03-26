const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A project must have a name'],
      trim: true,
      maxlength: [100, 'Project name cannot be more than 100 characters']
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'completed', 'on-hold', 'cancelled'],
      default: 'planning'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A project must have an owner']
    },
    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    tags: [String],
    category: {
      type: String,
      trim: true
    },
    budget: {
      type: Number,
      default: 0
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Completion percentage cannot be less than 0'],
      max: [100, 'Completion percentage cannot be more than 100']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate for tasks
projectSchema.virtual('tasks', {
  ref: 'Task',
  foreignField: 'project',
  localField: '_id'
});

// Populate members and owner when finding projects
projectSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'members',
    select: 'name email avatar'
  }).populate({
    path: 'owner',
    select: 'name email avatar'
  });
  
  next();
});

// Calculate completion percentage based on tasks
projectSchema.methods.calculateCompletionPercentage = async function() {
  const Task = mongoose.model('Task');
  
  const stats = await Task.aggregate([
    {
      $match: { project: this._id }
    },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);
  
  if (stats.length > 0) {
    const { totalTasks, completedTasks } = stats[0];
    this.completionPercentage = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
    
    await this.save({ validateBeforeSave: false });
  }
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
