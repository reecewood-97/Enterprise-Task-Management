# Enterprise Task Management System

A comprehensive full-stack application for managing projects and tasks in an enterprise environment.

## Overview

The Enterprise Task Management System is designed to help teams organize, track, and manage their projects and tasks efficiently. It provides a user-friendly interface with powerful features for project management, task assignment, progress tracking, and team collaboration.

## Features

- **User Authentication & Authorization**
  - Secure login and registration
  - Role-based access control
  - JWT authentication

- **Dashboard**
  - Overview of projects and tasks
  - Statistics and progress charts
  - Recent activities and notifications

- **Project Management**
  - Create, view, edit, and delete projects
  - Assign team members to projects
  - Track project progress and status
  - Project details with tasks and team members

- **Task Management**
  - Create, view, edit, and delete tasks
  - Assign tasks to team members
  - Set priorities, due dates, and statuses
  - Filter and search tasks

- **User Profile**
  - View and edit personal information
  - Change password
  - View activity statistics

- **Settings**
  - Notification preferences
  - Appearance settings
  - Security settings

## Technology Stack

### Frontend
- React.js
- Redux for state management
- Material-UI for UI components
- React Router for navigation
- Formik and Yup for form validation
- Axios for API requests

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- RESTful API architecture

## Project Structure

```
enterprise-se-project/
├── frontend/                  # Frontend React application
│   ├── public/                # Public assets
│   ├── src/
│   │   ├── api/               # API services and axios configuration
│   │   ├── assets/            # Images, fonts, and other static assets
│   │   ├── components/        # Reusable UI components
│   │   │   ├── common/        # Common components (LoadingScreen, ConfirmDialog, etc.)
│   │   │   ├── guards/        # Route guards (AuthGuard, GuestGuard)
│   │   │   └── layout/        # Layout components (Header, Sidebar, Footer)
│   │   ├── pages/             # Page components
│   │   ├── redux/             # Redux store, slices, and actions
│   │   ├── routes/            # Route configuration
│   │   ├── utils/             # Utility functions
│   │   ├── App.js             # Main App component
│   │   └── index.js           # Entry point
│   ├── package.json           # Frontend dependencies
│   └── README.md              # Frontend documentation
│
├── backend/                   # Backend Node.js application
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   └── index.js           # Entry point
│   ├── package.json           # Backend dependencies
│   └── README.md              # Backend documentation
│
├── package.json               # Root package.json for scripts
└── README.md                  # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/enterprise-se-project.git
   cd enterprise-se-project
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the backend directory based on the `.env.example` file:
     ```
     PORT=5000
     MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/task-management?retryWrites=true&w=majority
     JWT_SECRET=your_jwt_secret
     JWT_EXPIRES_IN=7d
     NODE_ENV=development
     ```
   - You can use either a local MongoDB database or MongoDB Atlas for cloud-based storage

4. Start the development servers:
   ```bash
   # Start backend server (from the backend directory)
   npm start
   
   # Start frontend server (from the frontend directory)
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Recent Updates

- Transitioned to MongoDB Atlas for persistent data storage
- Enhanced authentication with improved JWT token verification
- Improved error handling in the authentication middleware
- Enhanced project creation functionality

## Deployment

The application can be deployed to various platforms:

- **Frontend**: Netlify, Vercel, or AWS S3
- **Backend**: Heroku, AWS EC2, or Digital Ocean

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [Material-UI](https://mui.com/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
