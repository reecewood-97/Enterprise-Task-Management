import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Fetch all users
 */
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch users, using default users instead:', error);
      // Return default users if API call fails
      return [
        { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
        { _id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
      ];
    }
  }
);

// Initial state
const initialState = {
  users: [
    { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
    { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
    { _id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
  ],
  loading: false,
  error: null
};

// User slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default userSlice.reducer;
