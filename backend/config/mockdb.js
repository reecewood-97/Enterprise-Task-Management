/**
 * Mock database service for development and testing
 */
const mockUsers = [
  {
    _id: '60d0fe4f5311236168a109ca',
    name: 'Admin User',
    email: 'admin@example.com',
    password: '$2a$12$q0OtCW1InCYHACS0xhLdOOUP/7o9.xCGTZg5EHxVnVvuZZQxEDhLa', // password123
    role: 'admin',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    _id: '60d0fe4f5311236168a109cb',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$12$q0OtCW1InCYHACS0xhLdOOUP/7o9.xCGTZg5EHxVnVvuZZQxEDhLa', // password123
    role: 'user',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02')
  },
  {
    _id: '60d0fe4f5311236168a109cc',
    name: 'Simple User',
    email: 'simple@example.com',
    password: '$2a$12$q0OtCW1InCYHACS0xhLdOOUP/7o9.xCGTZg5EHxVnVvuZZQxEDhLa', // password123
    role: 'user',
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-03')
  }
];

const mockProjects = [
  {
    _id: '60d0fe4f5311236168a109d0',
    name: 'Website Redesign',
    description: 'Redesign the company website with modern UI/UX',
    status: 'in-progress',
    owner: '60d0fe4f5311236168a109ca',
    members: ['60d0fe4f5311236168a109ca', '60d0fe4f5311236168a109cb'],
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2023-02-01')
  },
  {
    _id: '60d0fe4f5311236168a109d1',
    name: 'Mobile App Development',
    description: 'Develop a mobile app for iOS and Android',
    status: 'planning',
    owner: '60d0fe4f5311236168a109ca',
    members: ['60d0fe4f5311236168a109ca', '60d0fe4f5311236168a109cc'],
    createdAt: new Date('2023-02-05'),
    updatedAt: new Date('2023-02-05')
  }
];

const mockTasks = [
  {
    _id: '60d0fe4f5311236168a109e0',
    title: 'Design Homepage',
    description: 'Create mockups for the homepage',
    status: 'in-progress',
    priority: 'high',
    project: '60d0fe4f5311236168a109d0',
    assignedTo: '60d0fe4f5311236168a109cb',
    createdBy: '60d0fe4f5311236168a109ca',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-02-10')
  },
  {
    _id: '60d0fe4f5311236168a109e1',
    title: 'Implement Authentication',
    description: 'Set up user authentication system',
    status: 'todo',
    priority: 'medium',
    project: '60d0fe4f5311236168a109d0',
    assignedTo: '60d0fe4f5311236168a109ca',
    createdBy: '60d0fe4f5311236168a109ca',
    createdAt: new Date('2023-02-12'),
    updatedAt: new Date('2023-02-12')
  }
];

// Mock database functions
const mockDb = {
  // User methods
  findUserById: (id) => mockUsers.find(user => user._id === id),
  findUserByEmail: (email) => mockUsers.find(user => user.email === email),
  getAllUsers: () => [...mockUsers],
  createUser: (name, email, password, role = 'user', department) => {
    const newUser = {
      _id: `mock-id-${Date.now()}`,
      name,
      email,
      password: '$2a$12$q0OtCW1InCYHACS0xhLdOOUP/7o9.xCGTZg5EHxVnVvuZZQxEDhLa', // password123
      role,
      department,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUsers.push(newUser);
    return newUser;
  },
  updateUser: (id, userData) => {
    const index = mockUsers.findIndex(user => user._id === id);
    if (index === -1) return null;
    
    mockUsers[index] = {
      ...mockUsers[index],
      ...userData,
      updatedAt: new Date()
    };
    return mockUsers[index];
  },
  
  // Authentication methods
  comparePassword: (user, password) => {
    // For mock purposes, we'll accept "password123" for all users
    // In a real app, this would use bcrypt.compare
    return password === 'password123' || password === 'simple123';
  },
  updateUserPassword: (user, newPassword) => {
    const index = mockUsers.findIndex(u => u._id === user._id);
    if (index === -1) return null;
    
    mockUsers[index] = {
      ...mockUsers[index],
      password: '$2a$12$q0OtCW1InCYHACS0xhLdOOUP/7o9.xCGTZg5EHxVnVvuZZQxEDhLa', // Pretend we hashed the new password
      updatedAt: new Date()
    };
    return mockUsers[index];
  },
  
  // Project methods
  findProjectById: (id) => mockProjects.find(project => project._id === id),
  getAllProjects: () => [...mockProjects],
  getUserProjects: (userId) => 
    mockProjects.filter(project => 
      project.owner === userId || project.members.includes(userId)
    ),
  createProject: (projectData) => {
    const newProject = {
      _id: `mock-id-${Date.now()}`,
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockProjects.push(newProject);
    return newProject;
  },
  updateProject: (id, projectData) => {
    const index = mockProjects.findIndex(project => project._id === id);
    if (index === -1) return null;
    
    mockProjects[index] = {
      ...mockProjects[index],
      ...projectData,
      updatedAt: new Date()
    };
    return mockProjects[index];
  },
  
  // Task methods
  findTaskById: (id) => mockTasks.find(task => task._id === id),
  getAllTasks: () => [...mockTasks],
  getProjectTasks: (projectId) => 
    mockTasks.filter(task => task.project === projectId),
  getUserTasks: (userId) => 
    mockTasks.filter(task => task.assignedTo === userId),
  createTask: (taskData) => {
    const newTask = {
      _id: `mock-id-${Date.now()}`,
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockTasks.push(newTask);
    return newTask;
  },
  updateTask: (id, taskData) => {
    const index = mockTasks.findIndex(task => task._id === id);
    if (index === -1) return null;
    
    mockTasks[index] = {
      ...mockTasks[index],
      ...taskData,
      updatedAt: new Date()
    };
    return mockTasks[index];
  }
};

module.exports = mockDb;
