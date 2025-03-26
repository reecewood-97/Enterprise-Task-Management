import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Link,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Assignment as TaskIcon,
  CheckCircle as CompletedIcon,
  Folder as ProjectIcon,
  HourglassEmpty as PendingIcon,
  People as TeamIcon,
  Schedule as ScheduleIcon,
  Warning as OverdueIcon
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Redux actions
import { fetchProjects } from '../redux/slices/projectSlice';
import { fetchMyTasks } from '../redux/slices/taskSlice';

// Utils
import { formatDate, formatRelativeTime } from '../utils/formatters';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

/**
 * Dashboard page component
 */
const Dashboard = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const { projects, loading: projectsLoading } = useSelector((state) => state.projects);
  const { myTasks, loading: tasksLoading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchMyTasks());
  }, [dispatch]);

  // Task status counts
  const completedTasks = myTasks.filter(task => task.status === 'completed').length;
  const pendingTasks = myTasks.filter(task => task.status === 'in-progress').length;
  const overdueTasks = myTasks.filter(task => {
    return task.status !== 'completed' && new Date(task.dueDate) < new Date();
  }).length;

  // Task priority counts
  const highPriorityTasks = myTasks.filter(task => task.priority === 'high').length;
  const mediumPriorityTasks = myTasks.filter(task => task.priority === 'medium').length;
  const lowPriorityTasks = myTasks.filter(task => task.priority === 'low').length;

  // Chart data
  const taskStatusData = {
    labels: ['Completed', 'In Progress', 'Overdue'],
    datasets: [
      {
        data: [completedTasks, pendingTasks, overdueTasks],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.info.main,
          theme.palette.error.main,
        ],
        borderWidth: 0,
      },
    ],
  };

  const taskPriorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Tasks by Priority',
        data: [highPriorityTasks, mediumPriorityTasks, lowPriorityTasks],
        backgroundColor: [
          theme.palette.error.main,
          theme.palette.warning.main,
          theme.palette.success.main,
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Tasks by Priority',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  // Get recent projects
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  // Get upcoming tasks
  const upcomingTasks = [...myTasks]
    .filter(task => task.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Welcome back, {user?.name || 'User'}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={1}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Projects
                  </Typography>
                  <Typography variant="h4">
                    {projectsLoading ? '-' : projects.length}
                  </Typography>
                </Box>
                <ProjectIcon color="primary" sx={{ fontSize: 40 }} />
              </Stack>
              <Button
                component={RouterLink}
                to="/projects"
                size="small"
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 2 }}
              >
                View All
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={1}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    My Tasks
                  </Typography>
                  <Typography variant="h4">
                    {tasksLoading ? '-' : myTasks.length}
                  </Typography>
                </Box>
                <TaskIcon color="info" sx={{ fontSize: 40 }} />
              </Stack>
              <Button
                component={RouterLink}
                to="/tasks"
                size="small"
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 2 }}
              >
                View All
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={1}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Completed Tasks
                  </Typography>
                  <Typography variant="h4">
                    {tasksLoading ? '-' : completedTasks}
                  </Typography>
                </Box>
                <CompletedIcon color="success" sx={{ fontSize: 40 }} />
              </Stack>
              <LinearProgress
                variant="determinate"
                value={myTasks.length > 0 ? (completedTasks / myTasks.length) * 100 : 0}
                color="success"
                sx={{ mt: 2, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={1}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Overdue Tasks
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {tasksLoading ? '-' : overdueTasks}
                  </Typography>
                </Box>
                <OverdueIcon color="error" sx={{ fontSize: 40 }} />
              </Stack>
              <Button
                component={RouterLink}
                to="/tasks?filter=overdue"
                size="small"
                color="error"
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 2 }}
              >
                View All
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Lists */}
      <Grid container spacing={3}>
        {/* Task Status Chart */}
        <Grid item xs={12} md={4}>
          <Card elevation={1} sx={{ height: '100%' }}>
            <CardHeader title="Task Status" />
            <Divider />
            <CardContent>
              {tasksLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <CircularProgress />
                </Box>
              ) : myTasks.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <Typography variant="body1" color="textSecondary">
                    No tasks found
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ height: 300, position: 'relative' }}>
                  <Doughnut data={taskStatusData} options={chartOptions} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Task Priority Chart */}
        <Grid item xs={12} md={4}>
          <Card elevation={1} sx={{ height: '100%' }}>
            <CardHeader title="Task Priority" />
            <Divider />
            <CardContent>
              {tasksLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <CircularProgress />
                </Box>
              ) : myTasks.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <Typography variant="body1" color="textSecondary">
                    No tasks found
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ height: 300, position: 'relative' }}>
                  <Bar data={taskPriorityData} options={barChartOptions} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Tasks */}
        <Grid item xs={12} md={4}>
          <Card elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader 
              title="Upcoming Tasks" 
              action={
                <IconButton component={RouterLink} to="/tasks" size="small">
                  <ArrowForwardIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              {tasksLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <CircularProgress />
                </Box>
              ) : upcomingTasks.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <Typography variant="body1" color="textSecondary">
                    No upcoming tasks
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {upcomingTasks.map((task) => (
                    <React.Fragment key={task._id}>
                      <ListItem
                        component={RouterLink}
                        to={`/tasks/${task._id}`}
                        sx={{
                          px: 3,
                          py: 1.5,
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                          textDecoration: 'none',
                          color: 'inherit',
                        }}
                      >
                        <ListItemText
                          primary={task.title}
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="textPrimary"
                                sx={{ display: 'block' }}
                              >
                                {task.project?.name || 'No Project'}
                              </Typography>
                              <Typography
                                component="span"
                                variant="caption"
                                color={
                                  new Date(task.dueDate) < new Date()
                                    ? 'error.main'
                                    : 'textSecondary'
                                }
                                sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}
                              >
                                <ScheduleIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                                {formatRelativeTime(task.dueDate)}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Projects */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardHeader 
              title="Recent Projects" 
              action={
                <Button
                  component={RouterLink}
                  to="/projects/new"
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                >
                  New Project
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {projectsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : recentProjects.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    No projects found
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {recentProjects.map((project) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={project._id}>
                      <Paper
                        component={RouterLink}
                        to={`/projects/${project._id}`}
                        elevation={1}
                        sx={{
                          p: 2,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          textDecoration: 'none',
                          color: 'inherit',
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4,
                          },
                        }}
                      >
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h6" noWrap>
                            {project.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{
                              mb: 1,
                              display: '-webkit-box',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {project.description || 'No description'}
                          </Typography>
                        </Box>
                        <Box sx={{ mt: 'auto' }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={1}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TeamIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                              <Typography variant="caption">
                                {project.members?.length || 0} members
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                              {formatDate(project.updatedAt)}
                            </Typography>
                          </Stack>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
