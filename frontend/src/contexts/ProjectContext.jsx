import { createContext, useContext, useReducer, useCallback } from 'react';
import { projectAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProjectContext = createContext(null);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

const projectReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, loading: false, error: null };
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload, loading: false };
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [action.payload, ...state.projects],
        loading: false,
      };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p._id === action.payload._id ? action.payload : p
        ),
        currentProject:
          state.currentProject?._id === action.payload._id
            ? action.payload
            : state.currentProject,
        loading: false,
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((p) => p._id !== action.payload),
        currentProject:
          state.currentProject?._id === action.payload ? null : state.currentProject,
        loading: false,
      };
    case 'CLEAR_CURRENT_PROJECT':
      return { ...state, currentProject: null };
    default:
      return state;
  }
};

export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  const fetchProjects = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await projectAPI.getAll();
      dispatch({ type: 'SET_PROJECTS', payload: response.data });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch projects';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    }
  }, []);

  const fetchProjectById = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await projectAPI.getById(id);
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: response.data });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch project';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    }
  }, []);

  const createProject = useCallback(async (projectData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await projectAPI.create(projectData);
      dispatch({ type: 'ADD_PROJECT', payload: response.data });
      toast.success('Project created successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create project';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      throw error;
    }
  }, []);

  const updateProject = useCallback(async (id, projectData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await projectAPI.update(id, projectData);
      dispatch({ type: 'UPDATE_PROJECT', payload: response.data });
      toast.success('Project updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update project';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      throw error;
    }
  }, []);

  const deleteProject = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await projectAPI.delete(id);
      dispatch({ type: 'DELETE_PROJECT', payload: id });
      toast.success('Project deleted successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete project';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      throw error;
    }
  }, []);

  const addTeamMember = useCallback(async (projectId, userId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await projectAPI.addMember(projectId, userId);
      dispatch({ type: 'UPDATE_PROJECT', payload: response.data });
      toast.success('Team member added successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add team member';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      throw error;
    }
  }, []);

  const removeTeamMember = useCallback(async (projectId, userId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await projectAPI.removeMember(projectId, userId);
      dispatch({ type: 'UPDATE_PROJECT', payload: response.data });
      toast.success('Team member removed successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove team member';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      throw error;
    }
  }, []);

  const setCurrentProject = useCallback((project) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
  }, []);

  const clearCurrentProject = useCallback(() => {
    dispatch({ type: 'CLEAR_CURRENT_PROJECT' });
  }, []);

  const value = {
    projects: state.projects,
    currentProject: state.currentProject,
    loading: state.loading,
    error: state.error,
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    addTeamMember,
    removeTeamMember,
    setCurrentProject,
    clearCurrentProject,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};
