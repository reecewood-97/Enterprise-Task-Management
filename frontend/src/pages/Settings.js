import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
  Save as SaveIcon
} from '@mui/icons-material';

// Redux actions
import { updateUserSettings } from '../redux/slices/authSlice';
import { addNotification } from '../redux/slices/uiSlice';

// Components
import LoadingScreen from '../components/common/LoadingScreen';
import PageHeader from '../components/common/PageHeader';

/**
 * Settings page component
 * Allows users to configure application settings and preferences
 */
const Settings = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  
  // Default settings if not available in user object
  const defaultSettings = {
    notifications: {
      email: true,
      push: true,
      taskReminders: true,
      projectUpdates: true,
      teamMessages: true
    },
    appearance: {
      darkMode: false,
      denseMode: false,
      highContrast: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginNotifications: true
    }
  };
  
  // Merge user settings with defaults
  const [settings, setSettings] = useState({
    ...defaultSettings,
    ...(user?.settings || {})
  });
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle settings change
  const handleSettingChange = (category, setting, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value
      }
    });
  };
  
  // Handle save settings
  const handleSaveSettings = async () => {
    try {
      await dispatch(updateUserSettings(settings)).unwrap();
      
      dispatch(addNotification({
        message: 'Settings saved successfully',
        severity: 'success'
      }));
    } catch (error) {
      dispatch(addNotification({
        message: error.message || 'Failed to save settings',
        severity: 'error'
      }));
    }
  };
  
  // Loading state
  if (loading) {
    return <LoadingScreen message="Loading settings..." />;
  }
  
  return (
    <Container maxWidth="lg">
      <PageHeader 
        title="Settings" 
        subtitle="Configure your application preferences"
      />
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<PaletteIcon />} label="Appearance" />
          <Tab icon={<SecurityIcon />} label="Security" />
        </Tabs>
      </Paper>
      
      {/* Notifications Tab */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Manage how you receive notifications and updates
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Email Notifications"
                />
                <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                  Receive notifications via email
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.push}
                      onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Push Notifications"
                />
                <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                  Receive push notifications in your browser
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Notification Types
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.taskReminders}
                      onChange={(e) => handleSettingChange('notifications', 'taskReminders', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Task Reminders"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.projectUpdates}
                      onChange={(e) => handleSettingChange('notifications', 'projectUpdates', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Project Updates"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.teamMessages}
                      onChange={(e) => handleSettingChange('notifications', 'teamMessages', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Team Messages"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Appearance Tab */}
      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Appearance Settings
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Customize the look and feel of the application
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.appearance.darkMode}
                      onChange={(e) => handleSettingChange('appearance', 'darkMode', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Dark Mode"
                />
                <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                  Use dark theme throughout the application
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.appearance.denseMode}
                      onChange={(e) => handleSettingChange('appearance', 'denseMode', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Dense Mode"
                />
                <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                  Compact UI elements to show more content
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.appearance.highContrast}
                      onChange={(e) => handleSettingChange('appearance', 'highContrast', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="High Contrast"
                />
                <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                  Increase contrast for better accessibility
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Security Tab */}
      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Configure security options for your account
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Two-Factor Authentication"
                />
                <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                  Require a verification code in addition to your password
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.loginNotifications}
                      onChange={(e) => handleSettingChange('security', 'loginNotifications', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Login Notifications"
                />
                <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                  Receive notifications for new login attempts
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
        >
          Save Settings
        </Button>
      </Box>
    </Container>
  );
};

export default Settings;
