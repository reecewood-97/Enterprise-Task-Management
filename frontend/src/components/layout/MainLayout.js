import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box, CssBaseline, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/slices/uiSlice';

// Components
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Notifications from '../common/Notifications';

// Constants
const DRAWER_WIDTH = 280;

// Styled components
const MainWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.default
}));

const MainContent = styled('main')(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  width: '100%',
  ...(open && {
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${DRAWER_WIDTH}px)`,
      marginLeft: DRAWER_WIDTH,
    }
  }),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2)
  }
}));

const ContentWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(2.5),
  minHeight: 'calc(100vh - 88px)',
  display: 'flex',
  flexDirection: 'column',
  marginTop: theme.spacing(8) // Add margin-top to prevent header overlap
}));

/**
 * MainLayout component for authenticated pages
 * Includes header, sidebar, and content area
 */
const MainLayout = () => {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <MainWrapper>
      <CssBaseline />
      
      {/* Header */}
      <Header 
        drawerWidth={DRAWER_WIDTH} 
        onDrawerToggle={handleDrawerToggle}
        sidebarOpen={sidebarOpen}
      >
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          onClick={handleSidebarToggle}
          edge="start"
          sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
        >
          <MenuIcon />
        </IconButton>
      </Header>
      
      {/* Sidebar */}
      <Sidebar 
        drawerWidth={DRAWER_WIDTH} 
        open={sidebarOpen} 
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
      />
      
      {/* Main Content */}
      <MainContent open={sidebarOpen}>
        <ContentWrapper>
          <Outlet />
        </ContentWrapper>
        <Footer />
      </MainContent>
      
      {/* Notifications */}
      <Notifications />
    </MainWrapper>
  );
};

export default MainLayout;
