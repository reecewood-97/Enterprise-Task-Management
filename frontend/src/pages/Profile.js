import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Camera as CameraIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Save as SaveIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Redux actions
import { updateProfile, updatePassword } from '../redux/slices/authSlice';
import { addNotification } from '../redux/slices/uiSlice';

// Components
import LoadingScreen from '../components/common/LoadingScreen';

// Profile form validation schema
const ProfileSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  bio: Yup.string()
    .max(200, 'Bio must be at most 200 characters')
});

// Password form validation schema
const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
});

/**
 * Profile page component
 * Allows users to view and update their profile information
 */
const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle profile update
  const handleUpdateProfile = async (values, { setSubmitting }) => {
    try {
      await dispatch(updateProfile(values)).unwrap();
      
      dispatch(addNotification({
        message: 'Profile updated successfully',
        severity: 'success'
      }));
    } catch (error) {
      dispatch(addNotification({
        message: error.message || 'Failed to update profile',
        severity: 'error'
      }));
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle password update
  const handleUpdatePassword = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(updatePassword(values)).unwrap();
      
      dispatch(addNotification({
        message: 'Password updated successfully',
        severity: 'success'
      }));
      
      resetForm();
    } catch (error) {
      dispatch(addNotification({
        message: error.message || 'Failed to update password',
        severity: 'error'
      }));
    } finally {
      setSubmitting(false);
    }
  };
  
  // Loading state
  if (loading || !user) {
    return <LoadingScreen message="Loading profile..." />;
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">My Profile</Typography>
        <Typography variant="body1" color="textSecondary">
          Manage your account settings and preferences
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Profile Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                >
                  {user.name.charAt(0)}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'background.paper',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                  size="small"
                >
                  <CameraIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Typography variant="h6">{user.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {user.email}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={1}>
                <Typography variant="body2" align="left">
                  <strong>Role:</strong> {user.role || 'User'}
                </Typography>
                <Typography variant="body2" align="left">
                  <strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" align="left">
                  <strong>Last Login:</strong> {new Date(user.lastLogin || Date.now()).toLocaleDateString()}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Statistics
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Projects
                  </Typography>
                  <Typography variant="h5">
                    {user.projects?.length || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Tasks
                  </Typography>
                  <Typography variant="h5">
                    {user.tasks?.length || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Completed Tasks
                  </Typography>
                  <Typography variant="h5">
                    {user.completedTasks || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Profile Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab icon={<AccountIcon />} label="Profile" />
              <Tab icon={<LockIcon />} label="Password" />
              <Tab icon={<SettingsIcon />} label="Preferences" />
            </Tabs>
          </Paper>
          
          {/* Profile Tab */}
          {tabValue === 0 && (
            <Card>
              <CardContent>
                <Formik
                  initialValues={{
                    name: user.name || '',
                    email: user.email || '',
                    bio: user.bio || '',
                    jobTitle: user.jobTitle || '',
                    department: user.department || '',
                    location: user.location || ''
                  }}
                  validationSchema={ProfileSchema}
                  onSubmit={handleUpdateProfile}
                >
                  {({ errors, touched, isSubmitting }) => (
                    <Form>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            name="name"
                            label="Full Name"
                            fullWidth
                            error={Boolean(touched.name && errors.name)}
                            helperText={touched.name && errors.name}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            name="email"
                            label="Email Address"
                            fullWidth
                            error={Boolean(touched.email && errors.email)}
                            helperText={touched.email && errors.email}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            name="bio"
                            label="Bio"
                            multiline
                            rows={4}
                            fullWidth
                            error={Boolean(touched.bio && errors.bio)}
                            helperText={touched.bio && errors.bio}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            name="jobTitle"
                            label="Job Title"
                            fullWidth
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            name="department"
                            label="Department"
                            fullWidth
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            name="location"
                            label="Location"
                            fullWidth
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            disabled={isSubmitting}
                          >
                            Save Changes
                          </Button>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              </CardContent>
            </Card>
          )}
          
          {/* Password Tab */}
          {tabValue === 1 && (
            <Card>
              <CardContent>
                <Formik
                  initialValues={{
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  }}
                  validationSchema={PasswordSchema}
                  onSubmit={handleUpdatePassword}
                >
                  {({ errors, touched, isSubmitting }) => (
                    <Form>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            name="currentPassword"
                            label="Current Password"
                            type="password"
                            fullWidth
                            error={Boolean(touched.currentPassword && errors.currentPassword)}
                            helperText={touched.currentPassword && errors.currentPassword}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            name="newPassword"
                            label="New Password"
                            type="password"
                            fullWidth
                            error={Boolean(touched.newPassword && errors.newPassword)}
                            helperText={touched.newPassword && errors.newPassword}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            name="confirmPassword"
                            label="Confirm New Password"
                            type="password"
                            fullWidth
                            error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                            helperText={touched.confirmPassword && errors.confirmPassword}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            disabled={isSubmitting}
                          >
                            Update Password
                          </Button>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              </CardContent>
            </Card>
          )}
          
          {/* Preferences Tab */}
          {tabValue === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Preferences
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Manage how you receive notifications and updates
                </Typography>
                
                {/* Notification preferences would go here */}
                <Typography variant="body2" color="textSecondary">
                  Notification preferences coming soon.
                </Typography>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>
                  Display Preferences
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Customize your display settings
                </Typography>
                
                {/* Display preferences would go here */}
                <Typography variant="body2" color="textSecondary">
                  Display preferences coming soon.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
