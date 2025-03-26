import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

/**
 * Footer component for the main layout
 */
const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900]
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' '}
          <Link color="inherit" href="#">
            Enterprise Task Management System
          </Link>
          {' | All rights reserved.'}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          <Link color="inherit" href="#" sx={{ mx: 1 }}>
            Privacy Policy
          </Link>
          |
          <Link color="inherit" href="#" sx={{ mx: 1 }}>
            Terms of Service
          </Link>
          |
          <Link color="inherit" href="#" sx={{ mx: 1 }}>
            Contact Us
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
