import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CompletedIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  HourglassEmpty as PendingIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Warning as OverdueIcon
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Redux actions
import { fetchTaskById, updateTask, deleteTask } from '../redux/slices/taskSlice';
import { fetchProjects } from '../redux/slices/projectSlice';
import { addNotification } from '../redux/slices/uiSlice';

// Components
import LoadingScreen from '../components/common/LoadingScreen';
import ConfirmDialog from '../components/common/ConfirmDialog';
import NoData from '../components/common/NoData';

// Utils
import { formatDate, formatRelativeTime, formatStatus } from '../utils/formatters';

// Task form validation schema
const TaskSchema = Yup.object().shape({
  title: Yup.string()
    .required('Task title is required')
    .min(3, 'Task title must be at least 3 characters'),
  description: Yup.string()
    .required('Description is required'),
  project: Yup.string()
    .required('Project is required'),
  assignedTo: Yup.string()
    .required('Assignee is required'),
  dueDate: Yup.date()
    .required('Due date is required'),
  priority: Yup.string()
    .required('Priority is required')
    .oneOf(['low', 'medium', 'high'], 'Invalid priority'),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['in-progress', 'completed'], 'Invalid status')
});

/**
 * TaskDetail page component
 * Displays detailed information about a specific task and allows editing
 */
const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentTask, loading: taskLoading } = useSelector((state) => state.tasks);
  const { projects } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);
  
  // Local state
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Fetch task and projects data
  useEffect(() => {
    dispatch(fetchTaskById(id));
    dispatch(fetchProjects());
  }, [dispatch, id]);
  
  // Handle edit mode toggle
  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };
  
  // Handle task update
  const handleUpdateTask = async (values, { setSubmitting }) => {
    try {
      await dispatch(updateTask({
        id,
        taskData: values
      })).unwrap();
      
      dispatch(addNotification({
        message: 'Task updated successfully',
        severity: 'success'
      }));
      
      setEditMode(false);
    } catch (error) {
      dispatch(addNotification({
        message: error.message || 'Failed to update task',
        severity: 'error'
      }));
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle delete dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  // Handle task deletion
  const handleDeleteTask = async () => {
    try {
      await dispatch(deleteTask(id)).unwrap();
      
      dispatch(addNotification({
        message: 'Task deleted successfully',
        severity: 'success'
      }));
      
      navigate('/tasks');
    } catch (error) {
      dispatch(addNotification({
        message: error.message || 'Failed to delete task',
        severity: 'error'
      }));
    }
  };
  
  // Get task status
  const getTaskStatus = () => {
    if (!currentTask) return {};
    
    if (currentTask.status === 'completed') {
      return {
        label: 'Completed',
        color: 'success',
        icon: <CompletedIcon />
      };
    }
    
    if (new Date(currentTask.dueDate) < new Date()) {
      return {
        label: 'Overdue',
        color: 'error',
        icon: <OverdueIcon />
      };
    }
    
    return {
      label: 'In Progress',
      color: 'info',
      icon: <PendingIcon />
    };
  };
  
  // Get priority chip props
  const getPriorityChipProps = (priority) => {
    switch (priority) {
      case 'high':
        return { label: 'High', color: 'error' };
      case 'medium':
        return { label: 'Medium', color: 'warning' };
      case 'low':
        return { label: 'Low', color: 'success' };
      default:
        return { label: priority, color: 'default' };
    }
  };
  
  // Loading state
  if (taskLoading && !currentTask) {
    return <LoadingScreen message="Loading task details..." />;
  }
  
  // Task not found
  if (!taskLoading && !currentTask) {
    return (
      <Container maxWidth="lg">
        <NoData
          title="Task not found"
          message="The task you are looking for does not exist or has been deleted."
          actionText="Back to Tasks"
          actionIcon={<ArrowBackIcon />}
          onActionClick={() => navigate('/tasks')}
        />
      </Container>
    );
  }
  
  // Task status
  const taskStatus = getTaskStatus();
  
  // Priority chip props
  const priorityChipProps = getPriorityChipProps(currentTask.priority);
  
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
        <Typography color="textPrimary">{currentTask?.title}</Typography>
      </Breadcrumbs>
      
      {/* Task Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h4">{currentTask?.title}</Typography>
          <Stack direction="row" spacing={1}>
            {!editMode && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleToggleEditMode}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleOpenDeleteDialog}
                >
                  Delete
                </Button>
              </>
            )}
            {editMode && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleToggleEditMode}
              >
                Cancel
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
      
      {/* Task Content */}
      {!editMode ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {currentTask?.description || 'No description provided.'}
                </Typography>
              </CardContent>
            </Card>
            
            {currentTask?.comments && currentTask.comments.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Comments
                  </Typography>
                  {/* Comments would go here */}
                  <Typography variant="body2" color="textSecondary">
                    Comments feature coming soon.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Status
                    </Typography>
                    <Chip
                      icon={taskStatus.icon}
                      label={taskStatus.label}
                      color={taskStatus.color}
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Priority
                    </Typography>
                    <Chip
                      label={priorityChipProps.label}
                      color={priorityChipProps.color}
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Project
                    </Typography>
                    {currentTask?.project ? (
                      <Link
                        component={RouterLink}
                        to={`/projects/${currentTask.project._id}`}
                        color="inherit"
                        underline="hover"
                      >
                        {currentTask.project.name}
                      </Link>
                    ) : (
                      <Typography variant="body2">No project assigned</Typography>
                    )}
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Assigned To
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        alt={currentTask?.assignedTo?.name}
                        src={currentTask?.assignedTo?.avatar}
                        sx={{ width: 24, height: 24 }}
                      >
                        {currentTask?.assignedTo?.name?.charAt(0) || <PersonIcon />}
                      </Avatar>
                      <Typography variant="body2">
                        {currentTask?.assignedTo?.name || 'Unassigned'}
                      </Typography>
                    </Stack>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Due Date
                    </Typography>
                    <Typography
                      variant="body2"
                      color={
                        currentTask?.status !== 'completed' && new Date(currentTask?.dueDate) < new Date()
                          ? 'error.main'
                          : 'textPrimary'
                      }
                    >
                      {formatDate(currentTask?.dueDate)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatRelativeTime(currentTask?.dueDate)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Created At
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(currentTask?.createdAt)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(currentTask?.updatedAt)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Formik
              initialValues={{
                title: currentTask?.title || '',
                description: currentTask?.description || '',
                project: currentTask?.project?._id || '',
                assignedTo: currentTask?.assignedTo?._id || user?._id || '',
                dueDate: currentTask?.dueDate ? new Date(currentTask.dueDate).toISOString().split('T')[0] : '',
                priority: currentTask?.priority || 'medium',
                status: currentTask?.status || 'in-progress'
              }}
              validationSchema={TaskSchema}
              onSubmit={handleUpdateTask}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="title"
                        label="Task Title"
                        fullWidth
                        error={Boolean(touched.title && errors.title)}
                        helperText={touched.title && errors.title}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="description"
                        label="Description"
                        multiline
                        rows={4}
                        fullWidth
                        error={Boolean(touched.description && errors.description)}
                        helperText={touched.description && errors.description}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Field
                        as={FormControl}
                        fullWidth
                        error={Boolean(touched.project && errors.project)}
                      >
                        <InputLabel id="project-label">Project</InputLabel>
                        <Field
                          as={Select}
                          labelId="project-label"
                          name="project"
                          label="Project"
                        >
                          {projects.map((project) => (
                            <MenuItem key={project._id} value={project._id}>
                              {project.name}
                            </MenuItem>
                          ))}
                        </Field>
                        {touched.project && errors.project && (
                          <Typography variant="caption" color="error">
                            {errors.project}
                          </Typography>
                        )}
                      </Field>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        name="dueDate"
                        label="Due Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        error={Boolean(touched.dueDate && errors.dueDate)}
                        helperText={touched.dueDate && errors.dueDate}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Field
                        as={FormControl}
                        fullWidth
                        error={Boolean(touched.priority && errors.priority)}
                      >
                        <InputLabel id="priority-label">Priority</InputLabel>
                        <Field
                          as={Select}
                          labelId="priority-label"
                          name="priority"
                          label="Priority"
                        >
                          <MenuItem value="low">Low</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                        </Field>
                        {touched.priority && errors.priority && (
                          <Typography variant="caption" color="error">
                            {errors.priority}
                          </Typography>
                        )}
                      </Field>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Field
                        as={FormControl}
                        fullWidth
                        error={Boolean(touched.status && errors.status)}
                      >
                        <InputLabel id="status-label">Status</InputLabel>
                        <Field
                          as={Select}
                          labelId="status-label"
                          name="status"
                          label="Status"
                        >
                          <MenuItem value="in-progress">In Progress</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                        </Field>
                        {touched.status && errors.status && (
                          <Typography variant="caption" color="error">
                            {errors.status}
                          </Typography>
                        )}
                      </Field>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Field
                        as={FormControl}
                        fullWidth
                        error={Boolean(touched.assignedTo && errors.assignedTo)}
                      >
                        <InputLabel id="assignedTo-label">Assigned To</InputLabel>
                        <Field
                          as={Select}
                          labelId="assignedTo-label"
                          name="assignedTo"
                          label="Assigned To"
                        >
                          <MenuItem value={user?._id}>{user?.name || 'Me'}</MenuItem>
                          {/* Additional team members would be listed here */}
                        </Field>
                        {touched.assignedTo && errors.assignedTo && (
                          <Typography variant="caption" color="error">
                            {errors.assignedTo}
                          </Typography>
                        )}
                      </Field>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          onClick={handleToggleEditMode}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          disabled={isSubmitting}
                        >
                          Save Changes
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      )}
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Task"
        content={`Are you sure you want to delete the task "${currentTask?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonProps={{ color: 'error' }}
        onConfirm={handleDeleteTask}
        onCancel={handleCloseDeleteDialog}
      />
    </Container>
  );
};

export default TaskDetail;
