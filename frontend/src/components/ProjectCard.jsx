import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Box,
  Avatar,
  AvatarGroup,
  Tooltip,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  People,
  CalendarToday,
} from '@mui/icons-material';
import { useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const ProjectCard = ({ project, onEdit, onDelete, onSelect }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    handleMenuClose();
    onEdit(project);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    handleMenuClose();
    onDelete(project);
  };

  const statusColor = {
    active: 'success',
    archived: 'default',
    completed: 'primary',
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={() => onSelect(project)}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            {project.title}
          </Typography>
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            <MenuItem onClick={handleEdit}>
              <Edit sx={{ mr: 1, fontSize: 20 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <Delete sx={{ mr: 1, fontSize: 20 }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '40px',
          }}
        >
          {project.description || 'No description'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            label={project.status}
            size="small"
            color={statusColor[project.status]}
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarToday sx={{ fontSize: 16 }} />
            <Typography variant="caption">
              {dayjs(project.createdAt).fromNow()}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <People sx={{ fontSize: 20, color: 'text.secondary' }} />
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 12 } }}>
            {project.owner && (
              <Tooltip title={project.owner.name}>
                <Avatar>{project.owner.name.charAt(0).toUpperCase()}</Avatar>
              </Tooltip>
            )}
            {project.teamMembers?.slice(0, 3).map((member) => (
              <Tooltip key={member._id} title={member.name}>
                <Avatar>{member.name.charAt(0).toUpperCase()}</Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            {project.teamMembers?.length || 0} members
          </Typography>
        </Box>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
