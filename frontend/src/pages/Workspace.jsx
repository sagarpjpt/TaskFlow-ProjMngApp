import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  AvatarGroup,
  Tooltip,
} from '@mui/material';
import {
  Add,
  ViewModule,
  ViewList,
  FolderOpen,
  Search,
} from '@mui/icons-material';
import { useProject } from '../contexts/ProjectContext';
import AppLayout from '../components/layout/AppLayout';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import EmptyState from '../components/common/EmptyState';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const Workspace = () => {
  const navigate = useNavigate();
  const { projects, fetchProjects, deleteProject, setCurrentProject } = useProject();
  const [loading, setLoading] = useState(true);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      await fetchProjects();
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectEdit = (project) => {
    setEditingProject(project);
    setProjectModalOpen(true);
  };

  const handleProjectDelete = async (project) => {
    if (window.confirm(`Are you sure you want to delete "${project.title}"? This will also delete all tickets and comments.`)) {
      await deleteProject(project._id);
    }
  };

  const handleProjectSelect = (project) => {
    setCurrentProject(project);
    navigate('/dashboard');
  };

  const handleProjectModalClose = () => {
    setProjectModalOpen(false);
    setEditingProject(null);
    loadProjects();
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      filters.search === '' ||
      project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.key?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus =
      filters.status === 'all' || project.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      archived: 'default',
      completed: 'primary',
    };
    return colors[status] || 'default';
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
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } }}
          >
            Workspace
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setProjectModalOpen(true)}
            sx={{ fontSize: { xs: '0.8rem', md: '0.95rem' } }}
          >
            New Project
          </Button>
        </Box>

        {/* Filters and View Toggle */}
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flexGrow: 1 }}>
              <TextField
                placeholder="Search projects..."
                size="small"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                sx={{ minWidth: { xs: '100%', sm: 250 } }}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              size="small"
            >
              <ToggleButton value="grid">
                <ViewModule sx={{ mr: { xs: 0, sm: 0.5 }, fontSize: 20 }} />
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Grid</Box>
              </ToggleButton>
              <ToggleButton value="table">
                <ViewList sx={{ mr: { xs: 0, sm: 0.5 }, fontSize: 20 }} />
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Table</Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Paper>

        {/* Projects Display */}
        {filteredProjects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No Projects Found"
            description={
              filters.search || filters.status !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first project to get started'
            }
            action={filters.search || filters.status !== 'all' ? null : () => setProjectModalOpen(true)}
            actionLabel="Create Project"
          />
        ) : viewMode === 'grid' ? (
          <Grid container spacing={3}>
            {filteredProjects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project._id}>
                <ProjectCard
                  project={project}
                  onEdit={handleProjectEdit}
                  onDelete={handleProjectDelete}
                  onSelect={handleProjectSelect}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Key
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Title
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Owner
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2" fontWeight={600}>
                      Members
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2" fontWeight={600}>
                      Status
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Last Activity
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow
                    key={project._id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleProjectSelect(project)}
                  >
                    <TableCell>
                      <Chip
                        label={project.key || 'N/A'}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {project.title}
                      </Typography>
                      {project.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {project.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                          {project.owner?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">{project.owner?.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <AvatarGroup max={3} sx={{ justifyContent: 'center' }}>
                        {project.teamMembers?.slice(0, 3).map((member) => (
                          <Tooltip key={member._id} title={member.name}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                              {member.name.charAt(0).toUpperCase()}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </AvatarGroup>
                      <Typography variant="caption" color="text.secondary">
                        {project.teamMembers?.length || 0} total
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={project.status}
                        size="small"
                        color={getStatusColor(project.status)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(project.updatedAt).fromNow()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <ProjectModal
        open={projectModalOpen}
        onClose={handleProjectModalClose}
        project={editingProject}
      />
    </AppLayout>
  );
};

export default Workspace;