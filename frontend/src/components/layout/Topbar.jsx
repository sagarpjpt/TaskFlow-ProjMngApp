import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Topbar = ({ handleDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    handleClose();
    navigate('/settings');
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

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - 260px)` },
        ml: { md: '260px' },
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            noWrap
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontWeight: 600,
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            Welcome back, {user?.name}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={user?.role || 'developer'}
            size="small"
            color={getRoleColor(user?.role)}
            sx={{
              textTransform: 'capitalize',
              fontWeight: 600,
              display: { xs: 'none', sm: 'inline-flex' },
            }}
          />
          <IconButton onClick={handleMenu} color="inherit">
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 700,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{ mt: 1 }}
          >
            <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <MenuItem onClick={handleSettings}>
              <Settings sx={{ mr: 1.5, fontSize: 20 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1.5, fontSize: 20 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;