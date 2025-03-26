import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  AvatarGroup,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CompletedIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Group as TeamIcon,
  HourglassEmpty as PendingIcon,
  Schedule as ScheduleIcon,
  Warning as OverdueIcon
} from '@mui/icons-material';

// Redux actions
import { fetchProjectById, deleteProject } from '../redux/slices/projectSlice';
import { fetchTasksByProject, createTask } from '../redux/slices/taskSlice';
import { addNotification } from '../redux/slices/uiSlice';

// Components
import LoadingScreen from '../components/common/LoadingScreen';
import ConfirmDialog from '../components/common/ConfirmDialog';
import NoData from '../components/common/NoData';

// Utils
import { formatDate, formatRelativeTime, formatPercentage } from '../utils/formatters';

/**
 * ProjectDetail page component
 * Displays detailed information about a specific project
 */
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentProject, loading: projectLoading } = useSelector((state) => state.projects);
  const { projectTasks, loading: tasksLoading } = useSelector((state) => state.tasks);
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Fetch project and tasks data
  useEffect(() => {
    dispatch(fetchProjectById(id));
    dispatch(fetchTasksByProject(id));
  }, [dispatch, id]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle delete dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  // Handle project deletion
  const handleDeleteProject = async () => {
    try {
      await dispatch(deleteProject(id)).unwrap();
      dispatch(addNotification({
        message: 'Project deleted successfully',
        severity: 'success'
      }));
      navigate('/projects');
    } catch (error) {
      dispatch(addNotification({
        message: error.message || 'Failed to delete project',
        severity: 'error'
      }));
    }
  };
  
  // Calculate project statistics
  const calculateProjectStats = () => {
    if (!projectTasks || !projectTasks.length) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        completionPercentage: 0
      };
    }
    
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
    const pendingTasks = projectTasks.filter(task => task.status === 'in-progress').length;
    const overdueTasks = projectTasks.filter(task => {
      return task.status !== 'completed' && new Date(task.dueDate) < new Date();
    }).length;
    
    const completionPercentage = (completedTasks / totalTasks) * 100;
    
    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionPercentage
    };
  };
  
  // Get project stats
  const projectStats = calculateProjectStats();
  
  // Get days remaining
  const getDaysRemaining = () => {
    if (!currentProject?.endDate) return 'No end date';
    
    const endDate = new Date(currentProject.endDate);
    const today = new Date();
    
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    }
    
    return `${diffDays} days remaining`;
  };
  
  // Loading state
  if (projectLoading && !currentProject) {
    return <LoadingScreen message="Loading project details..." />;
  }
  
  // Project not found
  if (!projectLoading && !currentProject) {
    return (
      <Container maxWidth="lg">
        <NoData
          title="Project not found"
          message="The project you are looking for does not exist or has been deleted."
          actionText="Back to Projects"
          actionIcon={<ArrowBackIcon />}
          onActionClick={() => navigate('/projects')}
        />
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/dashboard" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/projects" color="inherit">
          Projects
        </Link>
        <Typography color="textPrimary">{currentProject?.name}</Typography>
      </Breadcrumbs>
      
      {/* Project Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h4">{currentProject?.name}</Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              component={RouterLink}
              to={`/projects/${id}/edit`}
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
          </Stack>
        </Stack>
        <Typography variant="body1" color="textSecondary">
          {currentProject?.description}
        </Typography>
      </Box>
      
      {/* Project Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(currentProject?.startDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    End Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(currentProject?.endDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Progress
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={projectStats.completionPercentage}
                        sx={{ height: 10, borderRadius: 5 }}
                        color={currentProject?.isCompleted ? 'success' : 'primary'}
                      />
                    </Box>
                    <Box sx={{ minWidth: 45 }}>
                      <Typography variant="body2" color="textSecondary">
                        {formatPercentage(projectStats.completionPercentage)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    label={currentProject?.isCompleted ? 'Completed' : 'In Progress'}
                    color={currentProject?.isCompleted ? 'success' : 'primary'}
                    icon={currentProject?.isCompleted ? <CompletedIcon /> : <PendingIcon />}
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Timeline
                  </Typography>
                  <Typography variant="body2">
                    {getDaysRemaining()}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Team Members
                  </Typography>
                  <AvatarGroup max={5}>
                    {currentProject?.members?.map((member) => (
                      <Tooltip key={member._id} title={member.name || 'Unknown User'}>
                        <Avatar alt={member.name || 'Unknown'} src={member.avatar}>
                          {member.name ? member.name.charAt(0) : '?'}
                        </Avatar>
                      </Tooltip>
                    ))}
                    <Tooltip title="Add team member">
                      <Avatar sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
                        <AddIcon />
                      </Avatar>
                    </Tooltip>
                  </AvatarGroup>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Project Content Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Tasks" />
          <Tab label="Files" />
          <Tab label="Activity" />
        </Tabs>
      </Paper>
      
      {/* Tab Panels */}
      <Box sx={{ mb: 4 }}>
        {/* Tasks Tab */}
        {tabValue === 0 && (
          <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6">Tasks</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                component={RouterLink}
                to={`/tasks/new?project=${id}`}
              >
                Add Task
              </Button>
            </Stack>
            
            <Card>
              {tasksLoading ? (
                <LinearProgress />
              ) : projectTasks && projectTasks.length > 0 ? (
                <List>
                  {projectTasks && projectTasks.map((task) => {
                    const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();
                    
                    return (
                      <React.Fragment key={task._id}>
                        <ListItem
                          button
                          component={RouterLink}
                          to={`/tasks/${task._id}`}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor: task.status === 'completed'
                                  ? 'success.light'
                                  : isOverdue
                                    ? 'error.light'
                                    : 'primary.light'
                              }}
                            >
                              {task.status === 'completed' ? (
                                <CompletedIcon />
                              ) : isOverdue ? (
                                <OverdueIcon />
                              ) : (
                                <PendingIcon />
                              )}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={task.title}
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color={isOverdue ? 'error' : 'textSecondary'}
                                >
                                  Due {formatDate(task.dueDate)}
                                </Typography>
                                {task.assignedTo && (
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ ml: 1 }}
                                  >
                                    • Assigned to {task.assignedTo.name}
                                  </Typography>
                                )}
                              </>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Chip
                              size="small"
                              label={task.priority}
                              color={
                                task.priority === 'high'
                                  ? 'error'
                                  : task.priority === 'medium'
                                    ? 'warning'
                                    : 'success'
                              }
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : (
                <NoData
                  title="No tasks found"
                  message="This project doesn't have any tasks yet. Add a task to get started."
                  actionText="Add Task"
                  actionIcon={<AddIcon />}
                  onActionClick={() => navigate(`/tasks/new?project=${id}`)}
                />
              )}
            </Card>
          </>
        )}
        
        {/* Files Tab */}
        {tabValue === 1 && (
          <NoData
            title="No files uploaded"
            message="This project doesn't have any files yet. Upload a file to get started."
            actionText="Upload File"
            actionIcon={<AddIcon />}
            onActionClick={() => {}}
          />
        )}
        
        {/* Activity Tab */}
        {tabValue === 2 && (
          <NoData
            title="No activity recorded"
            message="This project doesn't have any activity recorded yet."
          />
        )}
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Project"
        content={`Are you sure you want to delete the project "${currentProject?.name}"? This action cannot be undone and all associated tasks will also be deleted.`}
        confirmText="Delete"
        confirmButtonProps={{ color: 'error' }}
        onConfirm={handleDeleteProject}
        onCancel={handleCloseDeleteDialog}
      />
    </Container>
  );
};

export default ProjectDetail;
