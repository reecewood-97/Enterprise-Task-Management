import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import TaskService from '../../api/task.service';

// Initial state
const initialState = {
  tasks: [],
  currentTask: null,
  projectTasks: [],
  myTasks: [],
  loading: false,
  error: null
};

// Async thunks for task actions
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await TaskService.getAllTasks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await TaskService.getTaskById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await TaskService.createTask(taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const response = await TaskService.updateTask(id, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await TaskService.deleteTask(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const addTaskComment = createAsyncThunk(
  'tasks/addTaskComment',
  async ({ taskId, text }, { rejectWithValue }) => {
    try {
      const response = await TaskService.addTaskComment(taskId, text);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchMyTasks = createAsyncThunk(
  'tasks/fetchMyTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await TaskService.getMyTasks();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchTasksByProject = createAsyncThunk(
  'tasks/fetchTasksByProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await TaskService.getTasksByProject(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Task slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.data.tasks;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch tasks' };
      })
      
      // Fetch task by ID
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload.data.task;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch task' };
      })
      
      // Create task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload.data.task);
        
        // If this task belongs to a project that we're currently viewing,
        // add it to the projectTasks array as well
        if (state.projectTasks && action.payload.data.task.project) {
          const projectId = typeof action.payload.data.task.project === 'object' 
            ? action.payload.data.task.project._id 
            : action.payload.data.task.project;
            
          // Check if we're currently viewing this project's tasks
          if (state.projectTasks.length > 0) {
            const currentProjectId = typeof state.projectTasks[0].project === 'object'
              ? state.projectTasks[0].project._id
              : state.projectTasks[0].project;
              
            if (projectId === currentProjectId) {
              state.projectTasks.push(action.payload.data.task);
            }
          }
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to create task' };
      })
      
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.data.task;
        state.tasks = state.tasks.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        );
        state.currentTask = updatedTask;
        
        // Also update in myTasks if present
        if (state.myTasks.some(task => task._id === updatedTask._id)) {
          state.myTasks = state.myTasks.map(task => 
            task._id === updatedTask._id ? updatedTask : task
          );
        }
        
        // Also update in projectTasks if present
        if (state.projectTasks.some(task => task._id === updatedTask._id)) {
          state.projectTasks = state.projectTasks.map(task => 
            task._id === updatedTask._id ? updatedTask : task
          );
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to update task' };
      })
      
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
        state.myTasks = state.myTasks.filter(task => task._id !== action.payload);
        state.projectTasks = state.projectTasks.filter(task => task._id !== action.payload);
        if (state.currentTask && state.currentTask._id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to delete task' };
      })
      
      // Add task comment
      .addCase(addTaskComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTaskComment.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.data.task;
        state.tasks = state.tasks.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        );
        state.currentTask = updatedTask;
        
        // Also update in projectTasks if present
        if (state.projectTasks.some(task => task._id === updatedTask._id)) {
          state.projectTasks = state.projectTasks.map(task => 
            task._id === updatedTask._id ? updatedTask : task
          );
        }
      })
      .addCase(addTaskComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to add comment' };
      })
      
      // Fetch my tasks
      .addCase(fetchMyTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.myTasks = action.payload.data.tasks;
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch your tasks' };
      })
      
      // Fetch tasks by project
      .addCase(fetchTasksByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projectTasks = action.payload.data.tasks;
      })
      .addCase(fetchTasksByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch project tasks' };
      });
  }
});

export const { clearTaskError, clearCurrentTask } = taskSlice.actions;

export default taskSlice.reducer;
