import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
} from '@mui/material';
import { useTicket } from '../contexts/TicketContext';
import { useProject } from '../contexts/ProjectContext';
import { authAPI } from '../services/api';

const TicketModal = ({ open, onClose, ticket = null, defaultProjectId = null }) => {
  const { createTicket, updateTicket, loading } = useTicket();
  const { projects } = useProject();
  const [users, setUsers] = useState([]);
  const isEdit = !!ticket;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      project: defaultProjectId || '',
      assignee: '',
      priority: 'medium',
      type: 'bug',
      tags: [],
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (ticket) {
      reset({
        title: ticket.title || '',
        description: ticket.description || '',
        project: ticket.project?._id || '',
        assignee: ticket.assignee?._id || '',
        priority: ticket.priority || 'medium',
        type: ticket.type || 'bug',
        tags: ticket.tags || [],
      });
    } else {
      reset({
        title: '',
        description: '',
        project: defaultProjectId || '',
        assignee: '',
        priority: 'medium',
        type: 'bug',
        tags: [],
      });
    }
  }, [ticket, defaultProjectId, reset]);

  const fetchUsers = async () => {
    try {
      const response = await authAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      const ticketData = {
        ...data,
        assignee: data.assignee || null,
      };

      if (isEdit) {
        await updateTicket(ticket._id, ticketData);
      } else {
        await createTicket(ticketData);
      }
      reset();
      onClose();
    } catch (error) {
      console.error('Error saving ticket:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Ticket' : 'Create New Ticket'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Ticket Title"
              {...register('title', {
                required: 'Title is required',
                maxLength: {
                  value: 200,
                  message: 'Title cannot exceed 200 characters',
                },
              })}
              error={!!errors.title}
              helperText={errors.title?.message}
              fullWidth
              autoFocus
            />

            <TextField
              label="Description"
              {...register('description', {
                maxLength: {
                  value: 2000,
                  message: 'Description cannot exceed 2000 characters',
                },
              })}
              error={!!errors.description}
              helperText={errors.description?.message}
              multiline
              rows={4}
              fullWidth
            />

            <FormControl fullWidth error={!!errors.project}>
              <InputLabel>Project</InputLabel>
              <Controller
                name="project"
                control={control}
                rules={{ required: 'Project is required' }}
                render={({ field }) => (
                  <Select {...field} label="Project">
                    <MenuItem value="">
                      <em>Select Project</em>
                    </MenuItem>
                    {projects.map((project) => (
                      <MenuItem key={project._id} value={project._id}>
                        {project.title}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.project && (
                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.5 }}>
                  {errors.project.message}
                </Box>
              )}
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Priority">
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="critical">Critical</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Type">
                      <MenuItem value="bug">Bug</MenuItem>
                      <MenuItem value="feature">Feature</MenuItem>
                      <MenuItem value="task">Task</MenuItem>
                      <MenuItem value="improvement">Improvement</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Assignee</InputLabel>
              <Controller
                name="assignee"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Assignee">
                    <MenuItem value="">
                      <em>Unassigned</em>
                    </MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Tags</InputLabel>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    multiple
                    input={<OutlinedInput label="Tags" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {['frontend', 'backend', 'database', 'ui', 'api', 'security', 'performance'].map(
                      (tag) => (
                        <MenuItem key={tag} value={tag}>
                          {tag}
                        </MenuItem>
                      )
                    )}
                  </Select>
                )}
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TicketModal;
