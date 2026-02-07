import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Archive,
  Restore,
  Delete,
  Search,
  FolderOpen,
  BugReport,
} from '@mui/icons-material';
import { useProject } from '../contexts/ProjectContext';
import { useTicket } from '../contexts/TicketContext';
import AppLayout from '../components/layout/AppLayout';
import EmptyState from '../components/common/EmptyState';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast from 'react-hot-toast';
import { projectAPI } from '../services/api';

dayjs.extend(relativeTime);

const Archived = () => {
  const { projects, fetchProjects, deleteProject } = useProject();
  const { tickets, fetchTickets } = useTicket();
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await fetchProjects();
      await fetchTickets();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setSearchTerm('');
  };

  const archivedProjects = projects.filter(
    (p) => p.status === 'archived' || p.status === 'completed'
  );

  const completedTickets = tickets.filter((t) => t.status === 'done');

  const filteredProjects = archivedProjects.filter((project) => {
    const matchesSearch =
      searchTerm === '' ||
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.key?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredTickets = completedTickets.filter((ticket) => {
    const matchesSearch =
      searchTerm === '' ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject =
      projectFilter === 'all' || ticket.project?._id === projectFilter;
    return matchesSearch && matchesProject;
  });

  const handleRestore = (item, type) => {
    setSelectedItem({ ...item, type });
    setRestoreDialogOpen(true);
  };

  const handleDelete = (item, type) => {
    setSelectedItem({ ...item, type });
    setDeleteDialogOpen(true);
  };

  const confirmRestore = async () => {
    try {
      if (selectedItem.type === 'project') {
        await projectAPI.restore(selectedItem._id);
        toast.success('Project restored successfully');
      }
      setRestoreDialogOpen(false);
      setSelectedItem(null);
      loadData();
    } catch (error) {
      toast.error('Failed to restore item');
      console.error('Error restoring:', error);
    }
  };

  const confirmDelete = async () => {
    try {
      if (selectedItem.type === 'project') {
        await deleteProject(selectedItem._id);
        toast.success('Project permanently deleted');
      }
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      loadData();
    } catch (error) {
      toast.error('Failed to delete item');
      console.error('Error deleting:', error);
    }
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
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } }}
          >
            Archived Items
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            View and restore archived projects and completed tickets
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Archived items are hidden from active views but not deleted. You can
          restore them anytime or permanently delete them.
        </Alert>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab
              icon={<FolderOpen />}
              label={`Projects (${archivedProjects.length})`}
              iconPosition="start"
              sx={{ fontSize: { xs: '0.8rem', md: '0.95rem' } }}
            />
            <Tab
              icon={<BugReport />}
              label={`Tickets (${completedTickets.length})`}
              iconPosition="start"
              sx={{ fontSize: { xs: '0.8rem', md: '0.95rem' } }}
            />
          </Tabs>
        </Paper>

        {/* Filters */}
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder={
                currentTab === 0 ? 'Search projects...' : 'Search tickets...'
              }
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 250 } }}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            {currentTab === 1 && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Project</InputLabel>
                <Select
                  value={projectFilter}
                  label="Filter by Project"
                  onChange={(e) => setProjectFilter(e.target.value)}
                >
                  <MenuItem value="all">All Projects</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.key ? `${project.key} - ` : ''}
                      {project.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </Paper>

        {/* Content */}
        {currentTab === 0 ? (
          filteredProjects.length === 0 ? (
            <EmptyState
              icon={Archive}
              title="No Archived Projects"
              description={
                searchTerm
                  ? 'No projects match your search'
                  : 'Archived projects will appear here'
              }
            />
          ) : (
            <Grid container spacing={3}>
              {filteredProjects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Chip
                          label={project.key || 'N/A'}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={project.status}
                          size="small"
                          color={project.status === 'completed' ? 'success' : 'default'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {project.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: 40,
                        }}
                      >
                        {project.description || 'No description'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Archived {dayjs(project.updatedAt).fromNow()}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        startIcon={<Restore />}
                        onClick={() => handleRestore(project, 'project')}
                      >
                        Restore
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(project, 'project')}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )
        ) : filteredTickets.length === 0 ? (
          <EmptyState
            icon={Archive}
            title="No Completed Tickets"
            description={
              searchTerm || projectFilter !== 'all'
                ? 'No tickets match your filters'
                : 'Completed tickets will appear here'
            }
          />
        ) : (
          <Grid container spacing={2}>
            {filteredTickets.map((ticket) => (
              <Grid item xs={12} key={ticket._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={`${ticket.project?.key}-${ticket.ticketNumber}`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={ticket.priority}
                            size="small"
                            color={
                              ticket.priority === 'critical' || ticket.priority === 'high'
                                ? 'error'
                                : ticket.priority === 'medium'
                                  ? 'warning'
                                  : 'success'
                            }
                          />
                          <Chip
                            label={ticket.type}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {ticket.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Completed {dayjs(ticket.updatedAt).fromNow()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Restore Dialog */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)}>
        <DialogTitle>Restore {selectedItem?.type}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to restore{' '}
            <strong>{selectedItem?.title}</strong>? It will be moved back to
            active items.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmRestore} variant="contained" startIcon={<Restore />}>
            Restore
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Permanent Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to <strong>permanently delete</strong>{' '}
            {selectedItem?.title}? This action cannot be undone.
            {selectedItem?.type === 'project' &&
              ' All tickets and comments in this project will also be deleted.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            startIcon={<Delete />}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};

export default Archived;