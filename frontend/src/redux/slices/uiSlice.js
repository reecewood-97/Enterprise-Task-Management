import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  darkMode: localStorage.getItem('darkMode') === 'true',
  sidebarOpen: false,
  notifications: [],
  loading: {
    global: false
  },
  dialog: {
    open: false,
    type: null,
    data: null
  }
};

// UI slice for managing UI state
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = {
        ...state.loading,
        [action.payload.key]: action.payload.value
      };
    },
    openDialog: (state, action) => {
      state.dialog = {
        open: true,
        type: action.payload.type,
        data: action.payload.data || null
      };
    },
    closeDialog: (state) => {
      state.dialog = {
        ...state.dialog,
        open: false
      };
    }
  }
});

export const {
  toggleDarkMode,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
  setLoading,
  openDialog,
  closeDialog
} = uiSlice.actions;

export default uiSlice.reducer;
