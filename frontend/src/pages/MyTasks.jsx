import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
} from '@mui/material';
import {
  ViewKanban,
  ViewModule,
  Assignment,
} from '@mui/icons-material';
import { useTicket } from '../contexts/TicketContext';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import KanbanBoard from '../components/KanbanBoard';
import TicketCard from '../components/TicketCard';
import TicketModal from '../components/TicketModal';
import TicketDetailModal from '../components/TicketDetailModal';
import EmptyState from '../components/common/EmptyState';
import { Grid } from '@mui/material';

const MyTasks = () => {
  const { user } = useAuth();
  const { tickets, fetchTickets, deleteTicket } = useTicket();
  const { projects, fetchProjects } = useProject();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketDetailOpen, setTicketDetailOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [filters, setFilters] = useState({
    project: 'all',
    priority: 'all',
    type: 'all',
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      await fetchProjects();
      await fetchTickets({ assignee: user._id });
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const handleTicketEdit = (ticket) => {
    setEditingTicket(ticket);
    setTicketModalOpen(true);
    setTicketDetailOpen(false);
  };

  const handleTicketDelete = async (ticket) => {
    if (window.confirm(`Are you sure you want to delete "${ticket.title}"?`)) {
      await deleteTicket(ticket._id);
      setTicketDetailOpen(false);
      loadData();
    }
  };

  const handleTicketView = (ticket) => {
    setViewingTicket(ticket);
    setTicketDetailOpen(true);
  };

  const handleTicketModalClose = () => {
    setTicketModalOpen(false);
    setEditingTicket(null);
    loadData();
  };

  const handleTicketDetailClose = () => {
    setTicketDetailOpen(false);
    setViewingTicket(null);
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesProject =
      filters.project === 'all' || ticket.project?._id === filters.project;
    const matchesPriority =
      filters.priority === 'all' || ticket.priority === filters.priority;
    const matchesType =
      filters.type === 'all' || ticket.type === filters.type;

    return matchesProject && matchesPriority && matchesType;
  });

  const taskStats = {
    total: filteredTickets.length,
    todo: filteredTickets.filter((t) => t.status === 'todo').length,
    inProgress: filteredTickets.filter((t) => t.status === 'in-progress').length,
    done: filteredTickets.filter((t) => t.status === 'done').length,
  };

  if (loading) {
    return (
      <AppLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box>
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } }}
            >
              My Tasks
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {taskStats.total} task{taskStats.total !== 1 ? 's' : ''} assigned to you
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewChange}
            size="small"
          >
            <ToggleButton value="kanban">
              <ViewKanban sx={{ mr: 0.5, fontSize: 20 }} />
              Kanban
            </ToggleButton>
            <ToggleButton value="grid">
              <ViewModule sx={{ mr: 0.5, fontSize: 20 }} />
              Grid
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label={`To Do: ${taskStats.todo}`}
            color="default"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={`In Progress: ${taskStats.inProgress}`}
            color="primary"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={`Done: ${taskStats.done}`}
            color="success"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Filters */}
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Project</InputLabel>
              <Select
                value={filters.project}
                label="Project"
                onChange={(e) =>
                  setFilters({ ...filters, project: e.target.value })
                }
              >
                <MenuItem value="all">All Projects</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.key ? `${project.key} - ` : ''}{project.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Priority"
                onChange={(e) =>
                  setFilters({ ...filters, priority: e.target.value })
                }
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="bug">Bug</MenuItem>
                <MenuItem value="feature">Feature</MenuItem>
                <MenuItem value="task">Task</MenuItem>
                <MenuItem value="improvement">Improvement</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Tasks Display */}
        {filteredTickets.length === 0 ? (
          <EmptyState
            icon={Assignment}
            title="No Tasks Assigned"
            description={
              filters.project !== 'all' || filters.priority !== 'all' || filters.type !== 'all'
                ? 'Try adjusting your filters'
                : "You don't have any tasks assigned to you yet"
            }
          />
        ) : viewMode === 'kanban' ? (
          <KanbanBoard
            onEditTicket={handleTicketEdit}
            onDeleteTicket={handleTicketDelete}
            onViewTicket={handleTicketView}
          />
        ) : (
          <Grid container spacing={2}>
            {filteredTickets.map((ticket) => (
              <Grid item xs={12} sm={6} md={4} key={ticket._id}>
                <TicketCard
                  ticket={ticket}
                  onEdit={handleTicketEdit}
                  onDelete={handleTicketDelete}
                  onClick={handleTicketView}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <TicketModal
        open={ticketModalOpen}
        onClose={handleTicketModalClose}
        ticket={editingTicket}
      />

      <TicketDetailModal
        open={ticketDetailOpen}
        onClose={handleTicketDetailClose}
        ticket={viewingTicket}
        onEdit={handleTicketEdit}
      />
    </AppLayout>
  );
};

export default MyTasks;