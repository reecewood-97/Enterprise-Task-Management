import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
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
  Visibility as ViewIcon
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Redux actions
import { fetchProjects, createProject, deleteProject } from '../redux/slices/projectSlice';
import { addNotification } from '../redux/slices/uiSlice';

// Utils
import { formatDate, formatRelativeTime } from '../utils/formatters';

// Project form validation schema
const ProjectSchema = Yup.object().shape({
  name: Yup.string()
    .required('Project name is required')
    .min(3, 'Project name must be at least 3 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  startDate: Yup.date()
    .required('Start date is required'),
  endDate: Yup.date()
    .min(
      Yup.ref('startDate'),
      'End date must be after start date'
    )
});

/**
 * Projects page component
 */
const Projects = () => {
  const dispatch = useDispatch();
  const { projects, loading } = useSelector((state) => state.projects);
  
  // State for search, filter, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('updatedAt');
  const [order, setOrder] = useState('desc');
  
  // State for new project dialog
  const [openNewProjectDialog, setOpenNewProjectDialog] = useState(false);
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Fetch projects on component mount
  useEffect(() => {
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

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(1);
  };

  // Handle new project dialog
  const handleOpenNewProjectDialog = () => {
    setOpenNewProjectDialog(true);
  };

  const handleCloseNewProjectDialog = () => {
    setOpenNewProjectDialog(false);
  };

  // Handle project creation
  const handleCreateProject = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(createProject(values)).unwrap();
      dispatch(addNotification({
        message: 'Project created successfully',
        severity: 'success'
      }));
      resetForm();
      handleCloseNewProjectDialog();
    } catch (error) {
      dispatch(addNotification({
        message: error.message || 'Failed to create project',
        severity: 'error'
      }));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete confirmation dialog
  const handleOpenDeleteDialog = (project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    try {
      await dispatch(deleteProject(projectToDelete._id)).unwrap();
      dispatch(addNotification({
        message: 'Project deleted successfully',
        severity: 'success'
      }));
      handleCloseDeleteDialog();
    } catch (error) {
      dispatch(addNotification({
        message: error.message || 'Failed to delete project',
        severity: 'error'
      }));
    }
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === 'all') return matchesSearch;
      if (filterStatus === 'active') return matchesSearch && !project.isCompleted;
      if (filterStatus === 'completed') return matchesSearch && project.isCompleted;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      const isAsc = order === 'asc';
      
      if (orderBy === 'name') {
        return isAsc
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      
      if (orderBy === 'updatedAt') {
        return isAsc
          ? new Date(a.updatedAt) - new Date(b.updatedAt)
          : new Date(b.updatedAt) - new Date(a.updatedAt);
      }
      
      if (orderBy === 'startDate') {
        return isAsc
          ? new Date(a.startDate) - new Date(b.startDate)
          : new Date(b.startDate) - new Date(a.startDate);
      }
      
      if (orderBy === 'endDate') {
        return isAsc
          ? new Date(a.endDate) - new Date(b.endDate)
          : new Date(b.endDate) - new Date(a.endDate);
      }
      
      return 0;
    });

  // Paginate projects
  const paginatedProjects = filteredProjects.slice(
    (page - 1) * rowsPerPage,
    (page - 1) * rowsPerPage + rowsPerPage
  );

  // Calculate project completion percentage
  const getCompletionPercentage = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h4">Projects</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenNewProjectDialog}
          >
            New Project
          </Button>
        </Stack>
        <Typography variant="body1" color="textSecondary">
          Manage your projects and track their progress
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search projects..."
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
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={filterStatus}
                label="Status"
                onChange={handleFilterChange}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Projects</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Projects Table */}
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
                        active={orderBy === 'name'}
                        direction={orderBy === 'name' ? order : 'asc'}
                        onClick={() => handleRequestSort('name')}
                      >
                        Project Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'startDate'}
                        direction={orderBy === 'startDate' ? order : 'asc'}
                        onClick={() => handleRequestSort('startDate')}
                      >
                        Start Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'endDate'}
                        direction={orderBy === 'endDate' ? order : 'asc'}
                        onClick={() => handleRequestSort('endDate')}
                      >
                        End Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedProjects.length > 0 ? (
                    paginatedProjects.map((project) => (
                      <TableRow key={project._id}>
                        <TableCell>
                          <Typography variant="subtitle2">
                            <RouterLink
                              to={`/projects/${project._id}`}
                              style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              {project.name}
                            </RouterLink>
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {project.members?.length || 0} members
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                            {project.description}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(project.startDate)}</TableCell>
                        <TableCell>{formatDate(project.endDate)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={getCompletionPercentage(project)}
                                sx={{ height: 8, borderRadius: 5 }}
                                color={project.isCompleted ? 'success' : 'primary'}
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="textSecondary">
                                {getCompletionPercentage(project)}%
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View">
                            <IconButton
                              component={RouterLink}
                              to={`/projects/${project._id}`}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              component={RouterLink}
                              to={`/projects/${project._id}/edit`}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => handleOpenDeleteDialog(project)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          No projects found
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          {searchTerm
                            ? `No results matching "${searchTerm}"`
                            : 'Create your first project to get started'}
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={handleOpenNewProjectDialog}
                        >
                          New Project
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {filteredProjects.length > rowsPerPage && (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={Math.ceil(filteredProjects.length / rowsPerPage)}
                  page={page}
                  onChange={handleChangePage}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* New Project Dialog */}
      <Dialog
        open={openNewProjectDialog}
        onClose={handleCloseNewProjectDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Project</DialogTitle>
        <Formik
          initialValues={{
            name: '',
            description: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
          }}
          validationSchema={ProjectSchema}
          onSubmit={handleCreateProject}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent>
                <Stack spacing={3}>
                  <Field
                    as={TextField}
                    name="name"
                    label="Project Name"
                    fullWidth
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
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
                    as={TextField}
                    name="startDate"
                    label="Start Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={Boolean(touched.startDate && errors.startDate)}
                    helperText={touched.startDate && errors.startDate}
                  />

                  <Field
                    as={TextField}
                    name="endDate"
                    label="End Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={Boolean(touched.endDate && errors.endDate)}
                    helperText={touched.endDate && errors.endDate}
                  />
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseNewProjectDialog}>Cancel</Button>
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
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the project "{projectToDelete?.name}"? 
            This action cannot be undone and all associated tasks will be deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteProject} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Projects;
