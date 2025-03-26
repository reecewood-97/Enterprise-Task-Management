import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  Folder as ProjectIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon
} from '@mui/icons-material';

// Styled components
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'center'
}));

// Navigation items
const mainNavItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />
  },
  {
    id: 'projects',
    title: 'Projects',
    path: '/projects',
    icon: <ProjectIcon />
  },
  {
    id: 'tasks',
    title: 'Tasks',
    path: '/tasks',
    icon: <TaskIcon />
  }
];

const secondaryNavItems = [
  {
    id: 'profile',
    title: 'Profile',
    path: '/profile',
    icon: <ProfileIcon />
  },
  {
    id: 'settings',
    title: 'Settings',
    path: '/settings',
    icon: <SettingsIcon />
  }
];

/**
 * Sidebar component for the main layout
 */
const Sidebar = ({ drawerWidth, open, mobileOpen, onDrawerToggle }) => {
  const theme = useTheme();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Check if a nav item is active
  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Drawer content
  const drawerContent = (
    <>
      <DrawerHeader>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            Task Management
          </Typography>
        </Box>
      </DrawerHeader>
      <Divider />
      
      {/* User info */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle1" fontWeight="medium">
          {user?.name || 'User'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {user?.email || 'user@example.com'}
        </Typography>
      </Box>
      <Divider />
      
      {/* Main navigation */}
      <List component="nav" sx={{ px: 2 }}>
        {mainNavItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isActiveRoute(item.path)}
              sx={{
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main
                  },
                  '& .MuiListItemText-primary': {
                    color: theme.palette.primary.main,
                    fontWeight: 'medium'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Divider />
      
      {/* Secondary navigation */}
      <List component="nav" sx={{ px: 2, pb: 2 }}>
        {secondaryNavItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isActiveRoute(item.path)}
              sx={{
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main
                  },
                  '& .MuiListItemText-primary': {
                    color: theme.palette.primary.main,
                    fontWeight: 'medium'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            zIndex: theme.zIndex.drawer
          }
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: 'none', md: 'block' },
          width: open ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            position: 'relative',
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen
            }),
            overflowX: 'hidden',
            zIndex: theme.zIndex.drawer - 1
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

Sidebar.propTypes = {
  drawerWidth: PropTypes.number.isRequired,
  open: PropTypes.bool.isRequired,
  mobileOpen: PropTypes.bool.isRequired,
  onDrawerToggle: PropTypes.func.isRequired
};

export default Sidebar;
