import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProjectService from '../../api/project.service';

// Initial state
const initialState = {
  projects: [],
  currentProject: null,
  projectStats: null,
  loading: false,
  error: null
};

// Async thunks for project actions
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params, { rejectWithValue }) => {
    try {
      const response = await ProjectService.getAllProjects(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await ProjectService.getProjectById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await ProjectService.createProject(projectData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      const response = await ProjectService.updateProject(id, projectData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id, { rejectWithValue }) => {
    try {
      await ProjectService.deleteProject(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const addProjectMember = createAsyncThunk(
  'projects/addProjectMember',
  async ({ projectId, userId }, { rejectWithValue }) => {
    try {
      const response = await ProjectService.addProjectMember(projectId, userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const removeProjectMember = createAsyncThunk(
  'projects/removeProjectMember',
  async ({ projectId, userId }, { rejectWithValue }) => {
    try {
      const response = await ProjectService.removeProjectMember(projectId, userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchProjectStats = createAsyncThunk(
  'projects/fetchProjectStats',
  async (id, { rejectWithValue }) => {
    try {
      const response = await ProjectService.getProjectStats(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Project slice
const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.data.projects;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch projects';
      })
      
      // Fetch project by ID
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload.data.project;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch project';
      })
      
      // Create project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload.data.project);
        state.currentProject = action.payload.data.project;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create project';
      })
      
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProject = action.payload.data.project;
        state.projects = state.projects.map(project => 
          project._id === updatedProject._id ? updatedProject : project
        );
        state.currentProject = updatedProject;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update project';
      })
      
      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(project => project._id !== action.payload);
        if (state.currentProject && state.currentProject._id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete project';
      })
      
      // Add project member
      .addCase(addProjectMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProjectMember.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProject = action.payload.data.project;
        state.projects = state.projects.map(project => 
          project._id === updatedProject._id ? updatedProject : project
        );
        state.currentProject = updatedProject;
      })
      .addCase(addProjectMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add member';
      })
      
      // Remove project member
      .addCase(removeProjectMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProjectMember.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProject = action.payload.data.project;
        state.projects = state.projects.map(project => 
          project._id === updatedProject._id ? updatedProject : project
        );
        state.currentProject = updatedProject;
      })
      .addCase(removeProjectMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to remove member';
      })
      
      // Fetch project stats
      .addCase(fetchProjectStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectStats.fulfilled, (state, action) => {
        state.loading = false;
        state.projectStats = action.payload.data.stats;
      })
      .addCase(fetchProjectStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch project stats';
      });
  }
});

export const { clearProjectError, clearCurrentProject } = projectSlice.actions;

export default projectSlice.reducer;
