import { createContext, useContext, useReducer, useCallback } from 'react';
import { ticketAPI } from '../services/api';
import toast from 'react-hot-toast';

const TicketContext = createContext(null);

export const useTicket = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTicket must be used within TicketProvider');
  }
  return context;
};

const initialState = {
  tickets: [],
  currentTicket: null,
  filters: {
    projectId: null,
    status: '',
    priority: '',
    assignee: '',
    type: '',
    search: '',
  },
  loading: false,
  error: null,
};

const ticketReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_TICKETS':
      return { ...state, tickets: action.payload, loading: false, error: null };
    case 'SET_CURRENT_TICKET':
      return { ...state, currentTicket: action.payload, loading: false };
    case 'ADD_TICKET':
      return {
        ...state,
        tickets: [action.payload, ...state.tickets],
        loading: false,
      };
    case 'UPDATE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map((t) =>
          t._id === action.payload._id ? action.payload : t
        ),
        currentTicket:
          state.currentTicket?._id === action.payload._id
            ? action.payload
            : state.currentTicket,
        loading: false,
      };
    case 'DELETE_TICKET':
      return {
        ...state,
        tickets: state.tickets.filter((t) => t._id !== action.payload),
        currentTicket:
          state.currentTicket?._id === action.payload ? null : state.currentTicket,
        loading: false,
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'CLEAR_FILTERS':
      return { ...state, filters: initialState.filters };
    case 'CLEAR_CURRENT_TICKET':
      return { ...state, currentTicket: null };
    default:
      return state;
  }
};

export const TicketProvider = ({ children }) => {
  const [state, dispatch] = useReducer(ticketReducer, initialState);

  const fetchTickets = useCallback(async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const queryParams = { ...state.filters, ...params };
      Object.keys(queryParams).forEach(
        (key) => !queryParams[key] && delete queryParams[key]
      );
      const response = await ticketAPI.getAll(queryParams);
      dispatch({ type: 'SET_TICKETS', payload: response.data });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch tickets';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    }
  }, [state.filters]);

  const fetchTicketById = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await ticketAPI.getById(id);
      dispatch({ type: 'SET_CURRENT_TICKET', payload: response.data });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch ticket';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    }
  }, []);

  const createTicket = useCallback(async (ticketData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await ticketAPI.create(ticketData);
      dispatch({ type: 'ADD_TICKET', payload: response.data });
      toast.success('Ticket created successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create ticket';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      throw error;
    }
  }, []);

  const updateTicket = useCallback(async (id, ticketData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await ticketAPI.update(id, ticketData);
      dispatch({ type: 'UPDATE_TICKET', payload: response.data });
      toast.success('Ticket updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update ticket';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      throw error;
    }
  }, []);

  const updateTicketStatus = useCallback(async (id, status) => {
    try {
      const response = await ticketAPI.updateStatus(id, status);
      dispatch({ type: 'UPDATE_TICKET', payload: response.data });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update status';
      toast.error(message);
      throw error;
    }
  }, []);

  const deleteTicket = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await ticketAPI.delete(id);
      dispatch({ type: 'DELETE_TICKET', payload: id });
      toast.success('Ticket deleted successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete ticket';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      throw error;
    }
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const setCurrentTicket = useCallback((ticket) => {
    dispatch({ type: 'SET_CURRENT_TICKET', payload: ticket });
  }, []);

  const clearCurrentTicket = useCallback(() => {
    dispatch({ type: 'CLEAR_CURRENT_TICKET' });
  }, []);

  const value = {
    tickets: state.tickets,
    currentTicket: state.currentTicket,
    filters: state.filters,
    loading: state.loading,
    error: state.error,
    fetchTickets,
    fetchTicketById,
    createTicket,
    updateTicket,
    updateTicketStatus,
    deleteTicket,
    setFilters,
    clearFilters,
    setCurrentTicket,
    clearCurrentTicket,
  };

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
};
