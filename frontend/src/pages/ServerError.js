import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import { Home as HomeIcon, Refresh as RefreshIcon } from '@mui/icons-material';

/**
 * ServerError page component
 * Displayed when a server error occurs
 */
const ServerError = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          py: 5
        }}
      >
        <Typography variant="h1" color="error" sx={{ mb: 2, fontSize: { xs: '6rem', md: '8rem' } }}>
          500
        </Typography>
        <Typography variant="h4" gutterBottom>
          Server Error
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: 480 }}>
          Sorry, something went wrong on our server. We're working to fix the issue.
          Please try again later or contact support if the problem persists.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            component={RouterLink}
            to="/"
            startIcon={<HomeIcon />}
            size="large"
          >
            Back to Home
          </Button>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
            size="large"
          >
            Refresh Page
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ServerError;
