import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Snackbar, Alert, Stack } from '@mui/material';
import { removeNotification } from '../../redux/slices/uiSlice';

/**
 * Notifications component to display toast notifications
 * Uses the notifications array from the UI state
 */
const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.ui);

  const handleClose = (id) => {
    dispatch(removeNotification(id));
  };

  return (
    <Stack spacing={2} sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000 }}>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          autoHideDuration={notification.duration || 6000}
          onClose={() => handleClose(notification.id)}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.severity || 'info'}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default Notifications;
