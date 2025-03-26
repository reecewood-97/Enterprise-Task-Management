import React from 'react';
import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box, Container, Typography, Link, CssBaseline } from '@mui/material';
import { useSelector } from 'react-redux';

// Styled components
const AuthWrapper = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary.light,
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2)
}));

const AuthCard = styled(Box)(({ theme }) => ({
  maxWidth: 480,
  width: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[10],
  overflow: 'hidden',
  position: 'relative'
}));

const LogoSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 3, 0),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
}));

const FooterSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  justifyContent: 'center',
  textAlign: 'center',
  borderTop: `1px solid ${theme.palette.divider}`
}));

/**
 * AuthLayout component for authentication pages
 * Provides a centered card layout for login, register, etc.
 */
const AuthLayout = () => {
  const { darkMode } = useSelector((state) => state.ui);
  
  return (
    <AuthWrapper>
      <CssBaseline />
      <Container maxWidth="sm">
        <AuthCard>
          {/* Logo Section */}
          <LogoSection>
            <Typography variant="h4" color="primary" gutterBottom>
              Task Management
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Enterprise Task Management System
            </Typography>
          </LogoSection>
          
          {/* Content */}
          <Box sx={{ p: 3 }}>
            <Outlet />
          </Box>
          
          {/* Footer */}
          <FooterSection>
            <Typography variant="body2" color="textSecondary">
              © {new Date().getFullYear()} Task Management System. All rights reserved.
              <br />
              <Link href="#" underline="hover">
                Terms of Service
              </Link>
              {' • '}
              <Link href="#" underline="hover">
                Privacy Policy
              </Link>
            </Typography>
          </FooterSection>
        </AuthCard>
      </Container>
    </AuthWrapper>
  );
};

export default AuthLayout;
