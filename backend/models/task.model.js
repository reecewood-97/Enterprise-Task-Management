const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A task must have a title'],
      trim: true,
      maxlength: [100, 'Task title cannot be more than 100 characters']
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'completed'],
      default: 'todo'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    dueDate: Date,
    project: {
      type: mongoose.Schema.ObjectId,
      ref: 'Project',
      required: [true, 'A task must belong to a project']
    },
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A task must have a creator']
    },
    estimatedHours: {
      type: Number,
      min: [0, 'Estimated hours cannot be negative']
    },
    actualHours: {
      type: Number,
      min: [0, 'Actual hours cannot be negative']
    },
    tags: [String],
    attachments: [
      {
        name: String,
        path: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    comments: [
      {
        text: {
          type: String,
          required: [true, 'Comment cannot be empty']
        },
        createdBy: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: [true, 'Comment must have an author']
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    dependencies: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Task'
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Populate references when finding tasks
taskSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'assignedTo',
    select: 'name email avatar'
  })
    .populate({
      path: 'createdBy',
      select: 'name email avatar'
    })
    .populate({
      path: 'comments.createdBy',
      select: 'name email avatar'
    });
  
  next();
});

// Update project completion percentage when a task is saved or updated
taskSchema.post('save', async function() {
  // Get the Project model
  const Project = mongoose.model('Project');
  
  // Find the project and update its completion percentage
  const project = await Project.findById(this.project);
  if (project) {
    await project.calculateCompletionPercentage();
  }
});

// Also update project completion percentage when a task is deleted
taskSchema.post('remove', async function() {
  const Project = mongoose.model('Project');
  
  const project = await Project.findById(this.project);
  if (project) {
    await project.calculateCompletionPercentage();
  }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
