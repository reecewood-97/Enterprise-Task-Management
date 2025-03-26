const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../models/user.model');
const Project = require('../models/project.model');
const Task = require('../models/task.model');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management';

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin123!',
    role: 'admin',
    department: 'Management',
    jobTitle: 'System Administrator',
    createdAt: new Date(),
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123!',
    role: 'manager',
    department: 'Engineering',
    jobTitle: 'Project Manager',
    createdAt: new Date(),
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'Password123!',
    role: 'user',
    department: 'Engineering',
    jobTitle: 'Software Developer',
    createdAt: new Date(),
  }
];

const projects = [
  {
    name: 'Website Redesign',
    description: 'Redesign the company website with modern UI/UX principles',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: 'active',
    priority: 'high',
    tags: ['website', 'design', 'frontend'],
    category: 'Web Development',
    budget: 15000,
  },
  {
    name: 'Mobile App Development',
    description: 'Develop a mobile app for both iOS and Android platforms',
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    status: 'planning',
    priority: 'medium',
    tags: ['mobile', 'app', 'development'],
    category: 'Mobile Development',
    budget: 25000,
  },
  {
    name: 'Database Migration',
    description: 'Migrate legacy database to new cloud infrastructure',
    startDate: new Date(),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    status: 'on-hold',
    priority: 'high',
    tags: ['database', 'migration', 'cloud'],
    category: 'Infrastructure',
    budget: 10000,
  }
];

const tasks = [
  {
    title: 'Design Homepage Mockup',
    description: 'Create mockup designs for the new homepage',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: 'in-progress',
    priority: 'high',
    estimatedHours: 10,
    tags: ['design', 'ui', 'homepage']
  },
  {
    title: 'Implement Authentication',
    description: 'Implement user authentication and authorization',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    status: 'todo',
    priority: 'high',
    estimatedHours: 15,
    tags: ['security', 'authentication']
  },
  {
    title: 'Database Schema Design',
    description: 'Design the database schema for the new system',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    status: 'completed',
    priority: 'medium',
    estimatedHours: 8,
    actualHours: 10,
    tags: ['database', 'schema']
  },
  {
    title: 'API Documentation',
    description: 'Create documentation for the REST API endpoints',
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    status: 'todo',
    priority: 'low',
    estimatedHours: 12,
    tags: ['documentation', 'api']
  }
];

// Seed function
async function seedDatabase() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Create users - don't hash passwords here, let the model handle it
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    // Get user IDs
    const adminId = createdUsers[0]._id;
    const managerId = createdUsers[1]._id;
    const userId = createdUsers[2]._id;

    // Create projects and assign to users
    const createdProjects = [];
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const newProject = await Project.create({
        ...project,
        owner: adminId, // Admin is the owner of all projects
        members: [managerId, userId]
      });
      createdProjects.push(newProject);
    }
    console.log(`Created ${createdProjects.length} projects`);

    // Create tasks and assign to projects and users
    const createdTasks = [];
    for (let i = 0; i < tasks.length; i++) {
      try {
        const task = tasks[i];
        const newTask = await Task.create({
          ...task,
          project: createdProjects[i % createdProjects.length]._id,
          assignedTo: userId,
          createdBy: adminId // Admin creates all tasks
        });
        createdTasks.push(newTask);
      } catch (error) {
        console.error('Error creating task:', error.message);
      }
    }
    console.log(`Created ${createdTasks.length} tasks`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
