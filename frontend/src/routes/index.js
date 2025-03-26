import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';

// Pages
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Projects';
import ProjectDetail from '../pages/ProjectDetail';
import Tasks from '../pages/Tasks';
import TaskDetail from '../pages/TaskDetail';
import TaskForm from '../pages/TaskForm';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';
import ServerError from '../pages/ServerError';

// Guards
import AuthGuard from '../components/guards/AuthGuard';
import GuestGuard from '../components/guards/GuestGuard';

/**
 * Application routes configuration
 */
export default function Router() {
  return useRoutes([
    {
      path: '/auth',
      element: <AuthLayout />,
      children: [
        { path: 'login', element: <GuestGuard><Login /></GuestGuard> },
        { path: 'register', element: <GuestGuard><Register /></GuestGuard> },
        { path: '', element: <Navigate to="/auth/login" /> }
      ]
    },
    {
      path: '/',
      element: <AuthGuard><MainLayout /></AuthGuard>,
      children: [
        { path: '', element: <Navigate to="/dashboard" /> },
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'projects', element: <Projects /> },
        { path: 'projects/:id', element: <ProjectDetail /> },
        { path: 'projects/:id/edit', element: <ProjectDetail /> },
        { path: 'tasks', element: <Tasks /> },
        { path: 'tasks/new', element: <TaskForm /> },
        { path: 'tasks/:id', element: <TaskDetail /> },
        { path: 'tasks/:id/edit', element: <TaskDetail /> },
        { path: 'profile', element: <Profile /> },
        { path: 'settings', element: <Settings /> },
        { path: 'server-error', element: <ServerError /> }
      ]
    },
    {
      path: '*',
      element: <NotFound />
    }
  ]);
}
