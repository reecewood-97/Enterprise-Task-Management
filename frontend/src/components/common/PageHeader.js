import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Stack, Typography } from '@mui/material';

/**
 * PageHeader component
 * Reusable header for pages with title, subtitle, and optional action button
 */
const PageHeader = ({
  title,
  subtitle,
  action,
  actionIcon,
  actionText,
  onActionClick,
  ...rest
}) => {
  return (
    <Box sx={{ mb: 4 }} {...rest}>
      <Stack 
        direction="row" 
        alignItems="center" 
        justifyContent="space-between" 
        sx={{ mb: subtitle ? 1 : 0 }}
      >
        <Typography variant="h4">{title}</Typography>
        {action && (
          <Button
            variant="contained"
            startIcon={actionIcon}
            onClick={onActionClick}
          >
            {actionText}
          </Button>
        )}
      </Stack>
      {subtitle && (
        <Typography variant="body1" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  action: PropTypes.bool,
  actionIcon: PropTypes.node,
  actionText: PropTypes.string,
  onActionClick: PropTypes.func
};

PageHeader.defaultProps = {
  subtitle: '',
  action: false,
  actionText: 'Action',
  onActionClick: () => {}
};

export default PageHeader;
