import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

// Redux actions
import { createTask } from '../redux/slices/taskSlice';
import { fetchProjects } from '../redux/slices/projectSlice';
import { fetchUsers } from '../redux/slices/userSlice';
import { addNotification } from '../redux/slices/uiSlice';
import { fetchTasksByProject } from '../redux/slices/taskSlice';

// Components
import LoadingScreen from '../components/common/LoadingScreen';

// Task form validation schema
const TaskSchema = Yup.object().shape({
  title: Yup.string()
    .required('Task title is required')
    .min(3, 'Task title must be at least 3 characters'),
  description: Yup.string()
    .required('Description is required'),
  project: Yup.string()
    .required('Project is required'),
  assignedTo: Yup.string(), // Make assignedTo optional
  dueDate: Yup.date()
    .required('Due date is required'),
  priority: Yup.string()
    .required('Priority is required')
    .oneOf(['low', 'medium', 'high'], 'Invalid priority'),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['todo', 'in-progress', 'review', 'completed'], 'Invalid status')
});

/**
 * TaskForm component for creating new tasks
 */
const TaskForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Get project ID from URL query params if available
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get('project');
  
  const { projects, loading: projectsLoading } = useSelector((state) => state.projects);
  const { users, loading: usersLoading } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);
  
  // Fetch projects and users data
  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchUsers());
  }, [dispatch]);
  
  // Initial form values
  const initialValues = {
    title: '',
    description: '',
    project: projectId || '',
    assignedTo: user?._id || '', // Use current user's ID if available
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    priority: 'medium',
    status: 'todo' // Change default status to match backend enum
  };
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Prepare task data
      const taskData = { ...values };
      
      // Ensure we're using the current user's ID
      if (!taskData.assignedTo && user?._id) {
        taskData.assignedTo = user._id;
      }
      
      // Remove assignedTo if it's still empty
      if (!taskData.assignedTo) {
        delete taskData.assignedTo;
      }
      
      await dispatch(createTask(taskData)).unwrap();
      
      dispatch(addNotification({
        message: 'Task created successfully',
        severity: 'success'
      }));
      
      // Refresh project tasks if creating from project detail page
      if (projectId) {
        dispatch(fetchTasksByProject(projectId));
        navigate(`/projects/${projectId}`);
      } else {
        navigate('/tasks');
      }
    } catch (error) {
      dispatch(addNotification({
        message: error.message || 'Failed to create task',
        severity: 'error'
      }));
    } finally {
      setSubmitting(false);
    }
  };
  
  // Loading state
  if (projectsLoading || usersLoading) {
    return <LoadingScreen message="Loading form data..." />;
  }
  
  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/dashboard" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/tasks" color="inherit">
          Tasks
        </Link>
        <Typography color="textPrimary">New Task</Typography>
      </Breadcrumbs>
      
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">Create New Task</Typography>
        <Typography variant="body1" color="textSecondary">
          Fill in the details below to create a new task
        </Typography>
      </Box>
      
      {/* Task Form */}
      <Card>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={TaskSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, values, handleChange, setFieldValue, isSubmitting }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Task Title"
                      name="title"
                      error={touched.title && Boolean(errors.title)}
                      helperText={touched.title && errors.title}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      multiline
                      rows={4}
                      label="Description"
                      name="description"
                      error={touched.description && Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={touched.project && Boolean(errors.project)}>
                      <InputLabel>Project</InputLabel>
                      <Field
                        as={Select}
                        name="project"
                        label="Project"
                      >
                        {projects && projects.map((project) => (
                          <MenuItem key={project._id} value={project._id}>
                            {project.name}
                          </MenuItem>
                        ))}
                      </Field>
                      {touched.project && errors.project && (
                        <FormHelperText>{errors.project}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={touched.assignedTo && Boolean(errors.assignedTo)}>
                      <InputLabel>Assigned To</InputLabel>
                      <Field
                        as={Select}
                        name="assignedTo"
                        label="Assigned To"
                      >
                        {/* Always include current user as an option */}
                        {user && (
                          <MenuItem key={user._id} value={user._id}>
                            {user.name} (You)
                          </MenuItem>
                        )}
                        
                        {/* Include other users if available */}
                        {users && users.length > 0 && users.filter(u => u._id !== user?._id).map((otherUser) => (
                          <MenuItem key={otherUser._id} value={otherUser._id}>
                            {otherUser.name}
                          </MenuItem>
                        ))}
                      </Field>
                      {touched.assignedTo && errors.assignedTo && (
                        <FormHelperText>{errors.assignedTo}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Due Date"
                        value={values.dueDate}
                        onChange={(newValue) => {
                          setFieldValue('dueDate', newValue);
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: touched.dueDate && Boolean(errors.dueDate),
                            helperText: touched.dueDate && errors.dueDate
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth error={touched.priority && Boolean(errors.priority)}>
                      <InputLabel>Priority</InputLabel>
                      <Field
                        as={Select}
                        name="priority"
                        label="Priority"
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Field>
                      {touched.priority && errors.priority && (
                        <FormHelperText>{errors.priority}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth error={touched.status && Boolean(errors.status)}>
                      <InputLabel>Status</InputLabel>
                      <Field
                        as={Select}
                        name="status"
                        label="Status"
                      >
                        <MenuItem value="todo">Todo</MenuItem>
                        <MenuItem value="in-progress">In Progress</MenuItem>
                        <MenuItem value="review">Review</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                      </Field>
                      {touched.status && errors.status && (
                        <FormHelperText>{errors.status}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={isSubmitting}
                      >
                        Create Task
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TaskForm;
