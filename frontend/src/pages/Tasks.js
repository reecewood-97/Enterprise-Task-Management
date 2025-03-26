import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Visibility as ViewIcon,
  CheckCircle as CompletedIcon,
  HourglassEmpty as PendingIcon,
  Schedule as ScheduleIcon,
  Warning as OverdueIcon
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Redux actions
import { fetchProjects } from '../redux/slices/projectSlice';
import { fetchTasks, createTask, deleteTask, updateTask } from '../redux/slices/taskSlice';
import { addNotification } from '../redux/slices/uiSlice';

// Utils
import { formatDate, formatRelativeTime } from '../utils/formatters';

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
    .oneOf(['low', 'medium', 'high'], 'Invalid priority')
});

/**
 * Tasks page component
 */
const Tasks = () => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.tasks);
  const { projects } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);
  
  // State for search, filter, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('dueDate');
  const [order, setOrder] = useState('asc');
  
  // State for new task dialog
  const [openNewTaskDialog, setOpenNewTaskDialog] = useState(false);
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Fetch tasks and projects on component mount
  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchProjects());
  }, [dispatch]);

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle search change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  // Handle filter changes
  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(1);
  };

  const handleFilterPriorityChange = (event) => {
    setFilterPriority(event.target.value);
    setPage(1);
  };

  const handleFilterProjectChange = (event) => {
    setFilterProject(event.target.value);
    setPage(1);
  };

  // Handle new task dialog
  const handleOpenNewTaskDialog = () => {
    setOpenNewTaskDialog(true);
  };

  const handleCloseNewTaskDialog = () => {
    setOpenNewTaskDialog(false);
  };

  // Handle task creation
  const handleCreateTask = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(createTask(values)).unwrap();
      dispatch(addNotification({
        message: 'Task created successfully',
        severity: 'success'
      }));
      resetForm();
      handleCloseNewTaskDialog();
    } catch (error) {
      dispatch(addNotification({
        message: error.message || 'Failed to create task',
        severity: 'error'
      }));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete confirmation dialog
  const handleOpenDeleteDialog = (task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  // Handle task deletion
  const handleDeleteTask = async () => {
    try {
      await dispatch(deleteTask(taskToDelete._id)).unwrap();
      dispatch(addNotification({
        message: 'Task deleted successfully',
        severity: 'success'
      }));
      handleCloseDeleteDialog();
    } catch (error) {
      dispatch(addNotification({
        message: error.message || 'Failed to delete task',
        severity: 'error'
      }));
    }
  };

  // Handle task status toggle
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'in-progress' : 'completed';
    try {
      await dispatch(updateTask({
        id: task._id,
        taskData: { status: newStatus }
      })).unwrap();
      dispatch(addNotification({
        message: `Task marked as ${newStatus === 'completed' ? 'completed' : 'in progress'}`,
        severity: 'success'
      }));
    } catch (error) {
      dispatch(addNotification({
        message: error.message || 'Failed to update task status',
        severity: 'error'
      }));
    }
  };

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'completed' && task.status === 'completed') ||
        (filterStatus === 'in-progress' && task.status === 'in-progress') ||
        (filterStatus === 'overdue' && task.status !== 'completed' && new Date(task.dueDate) < new Date());
      
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      
      const matchesProject = filterProject === 'all' || task.project?._id === filterProject;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    })
    .sort((a, b) => {
      const isAsc = order === 'asc';
      
      if (orderBy === 'title') {
        return isAsc
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      
      if (orderBy === 'dueDate') {
        return isAsc
          ? new Date(a.dueDate) - new Date(b.dueDate)
          : new Date(b.dueDate) - new Date(a.dueDate);
      }
      
      if (orderBy === 'priority') {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        return isAsc
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      
      if (orderBy === 'status') {
        const statusOrder = { 'in-progress': 1, 'completed': 2 };
        return isAsc
          ? statusOrder[a.status] - statusOrder[b.status]
          : statusOrder[b.status] - statusOrder[a.status];
      }
      
      return 0;
    });

  // Paginate tasks
  const paginatedTasks = filteredTasks.slice(
    (page - 1) * rowsPerPage,
    (page - 1) * rowsPerPage + rowsPerPage
  );

  // Get status chip color
  const getStatusChipProps = (task) => {
    if (task.status === 'completed') {
      return {
        label: 'Completed',
        color: 'success',
        icon: <CompletedIcon />
      };
    }
    
    if (new Date(task.dueDate) < new Date()) {
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

  // Get priority chip color
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

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h4">Tasks</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenNewTaskDialog}
          >
            New Task
          </Button>
        </Stack>
        <Typography variant="body1" color="textSecondary">
          Manage your tasks and track their progress
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={filterStatus}
                label="Status"
                onChange={handleFilterStatusChange}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="priority-filter-label">Priority</InputLabel>
              <Select
                labelId="priority-filter-label"
                value={filterPriority}
                label="Priority"
                onChange={handleFilterPriorityChange}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="project-filter-label">Project</InputLabel>
              <Select
                labelId="project-filter-label"
                value={filterProject}
                label="Project"
                onChange={handleFilterProjectChange}
              >
                <MenuItem value="all">All Projects</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tasks Table */}
      <Paper>
        {loading ? (
          <LinearProgress />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'title'}
                        direction={orderBy === 'title' ? order : 'asc'}
                        onClick={() => handleRequestSort('title')}
                      >
                        Task
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'priority'}
                        direction={orderBy === 'priority' ? order : 'asc'}
                        onClick={() => handleRequestSort('priority')}
                      >
                        Priority
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'dueDate'}
                        direction={orderBy === 'dueDate' ? order : 'asc'}
                        onClick={() => handleRequestSort('dueDate')}
                      >
                        Due Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'status'}
                        direction={orderBy === 'status' ? order : 'asc'}
                        onClick={() => handleRequestSort('status')}
                      >
                        Status
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTasks.length > 0 ? (
                    paginatedTasks.map((task) => {
                      const statusChipProps = getStatusChipProps(task);
                      const priorityChipProps = getPriorityChipProps(task.priority);
                      
                      return (
                        <TableRow key={task._id}>
                          <TableCell>
                            <Typography variant="subtitle2">
                              <RouterLink
                                to={`/tasks/${task._id}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                              >
                                {task.title}
                              </RouterLink>
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Assigned to: {task.assignedTo?.name || 'Unassigned'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {task.project ? (
                              <RouterLink
                                to={`/projects/${task.project._id}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                              >
                                {task.project.name}
                              </RouterLink>
                            ) : (
                              'No Project'
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={priorityChipProps.label}
                              color={priorityChipProps.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color={
                                task.status !== 'completed' && new Date(task.dueDate) < new Date()
                                  ? 'error'
                                  : 'textPrimary'
                              }
                            >
                              {formatDate(task.dueDate)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {formatRelativeTime(task.dueDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={statusChipProps.icon}
                              label={statusChipProps.label}
                              color={statusChipProps.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title={task.status === 'completed' ? 'Mark as In Progress' : 'Mark as Completed'}>
                              <IconButton
                                color={task.status === 'completed' ? 'default' : 'success'}
                                onClick={() => handleToggleStatus(task)}
                              >
                                <CompletedIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View">
                              <IconButton
                                component={RouterLink}
                                to={`/tasks/${task._id}`}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                component={RouterLink}
                                to={`/tasks/${task._id}/edit`}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                color="error"
                                onClick={() => handleOpenDeleteDialog(task)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          No tasks found
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          {searchTerm
                            ? `No results matching "${searchTerm}"`
                            : 'Create your first task to get started'}
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={handleOpenNewTaskDialog}
                        >
                          New Task
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {filteredTasks.length > rowsPerPage && (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={Math.ceil(filteredTasks.length / rowsPerPage)}
                  page={page}
                  onChange={handleChangePage}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* New Task Dialog */}
      <Dialog
        open={openNewTaskDialog}
        onClose={handleCloseNewTaskDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Task</DialogTitle>
        <Formik
          initialValues={{
            title: '',
            description: '',
            project: '',
            assignedTo: user?._id || '',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority: 'medium',
            status: 'in-progress'
          }}
          validationSchema={TaskSchema}
          onSubmit={handleCreateTask}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent>
                <Stack spacing={3}>
                  <Field
                    as={TextField}
                    name="title"
                    label="Task Title"
                    fullWidth
                    error={Boolean(touched.title && errors.title)}
                    helperText={touched.title && errors.title}
                  />

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
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseNewTaskDialog}>Cancel</Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  Create
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the task "{taskToDelete?.title}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteTask} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Tasks;
