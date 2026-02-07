import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  People,
  Search,
  ViewModule,
  ViewList,
} from '@mui/icons-material';
import { authAPI } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import EmptyState from '../components/common/EmptyState';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    sortBy: 'activeTickets',
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getTeamMembers();
      setMembers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      manager: 'secondary',
      developer: 'primary',
      viewer: 'default',
    };
    return colors[role] || 'default';
  };

  const filteredMembers = members
    .filter((member) => {
      const matchesSearch =
        filters.search === '' ||
        member.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        member.email.toLowerCase().includes(filters.search.toLowerCase());

      const matchesRole = filters.role === 'all' || member.role === filters.role;

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'activeTickets') {
        return (b.stats?.activeTickets || 0) - (a.stats?.activeTickets || 0);
      } else if (filters.sortBy === 'completedTickets') {
        return (b.stats?.completedTickets || 0) - (a.stats?.completedTickets || 0);
      } else if (filters.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

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
            Team Members
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {members.length} member{members.length !== 1 ? 's' : ''} in your projects
          </Typography>
        </Box>

        {/* Filters */}
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
                placeholder="Search members..."
                size="small"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                sx={{ minWidth: { xs: '100%', sm: 250 } }}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={filters.role}
                  label="Role"
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="developer">Developer</MenuItem>
                  <MenuItem value="viewer">Viewer</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  label="Sort By"
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                >
                  <MenuItem value="activeTickets">Active Tasks</MenuItem>
                  <MenuItem value="completedTickets">Completed</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
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

        {/* Members Display */}
        {filteredMembers.length === 0 ? (
          <EmptyState
            icon={People}
            title="No Members Found"
            description={
              filters.search || filters.role !== 'all'
                ? 'Try adjusting your filters'
                : 'No team members found in your projects'
            }
          />
        ) : viewMode === 'grid' ? (
          <Grid container spacing={3}>
            {filteredMembers.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member._id}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: 'primary.main',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          mr: 2,
                        }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {member.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {member.email}
                        </Typography>
                        <Chip
                          label={member.role}
                          size="small"
                          color={getRoleColor(member.role)}
                          sx={{
                            mt: 0.5,
                            textTransform: 'capitalize',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Active Tasks
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {member.stats?.activeTickets || 0}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(
                          ((member.stats?.activeTickets || 0) / 10) * 100,
                          100
                        )}
                        sx={{ mb: 2, height: 6, borderRadius: 1 }}
                      />

                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Completed
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {member.stats?.completedTickets || 0}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Projects
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {member.stats?.projectCount || 0}
                        </Typography>
                      </Box>
                    </Box>

                    {member.sharedProjects && member.sharedProjects.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 0.5 }}
                        >
                          Projects
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {member.sharedProjects.slice(0, 3).map((project) => (
                            <Chip
                              key={project._id}
                              label={project.key || project.title}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                          {member.sharedProjects.length > 3 && (
                            <Chip
                              label={`+${member.sharedProjects.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
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
                      Member
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2" fontWeight={600}>
                      Role
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2" fontWeight={600}>
                      Active Tasks
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2" fontWeight={600}>
                      Completed
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2" fontWeight={600}>
                      Projects
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {member.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {member.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={member.role}
                        size="small"
                        color={getRoleColor(member.role)}
                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600}>
                        {member.stats?.activeTickets || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600}>
                        {member.stats?.completedTickets || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip
                        title={member.sharedProjects
                          ?.map((p) => p.title)
                          .join(', ')}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {member.stats?.projectCount || 0}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </AppLayout>
  );
};

export default Members;