import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';

/**
 * NoData component
 * Displays a message when no data is available with an optional action button
 */
const NoData = ({
  title,
  message,
  actionText,
  actionIcon,
  onActionClick,
  ...rest
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 5,
        px: 3
      }}
      {...rest}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        {message}
      </Typography>
      {actionText && (
        <Button
          variant="outlined"
          startIcon={actionIcon}
          onClick={onActionClick}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};

NoData.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  actionText: PropTypes.string,
  actionIcon: PropTypes.node,
  onActionClick: PropTypes.func
};

NoData.defaultProps = {
  title: 'No data available',
  message: 'There are no items to display at the moment.',
  onActionClick: () => {}
};

export default NoData;
