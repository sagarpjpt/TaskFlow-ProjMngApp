import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  FolderOpen,
  Assignment,
  People,
  Archive,
  Settings,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 260;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    {
      title: 'Dashboard',
      icon: DashboardIcon,
      path: '/dashboard',
      roles: ['developer', 'manager', 'viewer', 'admin'],
    },
    {
      title: 'Workspace',
      icon: FolderOpen,
      path: '/workspace',
      roles: ['developer', 'manager', 'viewer', 'admin'],
    },
    {
      title: 'My Tasks',
      icon: Assignment,
      path: '/my-tasks',
      roles: ['developer', 'manager'],
    },
    {
      title: 'Members',
      icon: People,
      path: '/members',
      roles: ['developer', 'manager', 'viewer', 'admin'],
    },
    {
      title: 'Archived',
      icon: Archive,
      path: '/archived',
      roles: ['developer', 'manager', 'viewer', 'admin'],
    },
  ];

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              background: 'linear-gradient(135deg, #F63049 0%, #D02752 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: 'white',
              fontSize: '1.2rem',
            }}
          >
            TF
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #F63049 0%, #D02752 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            TaskFlow
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, px: 2, py: 1 }}>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(246, 48, 73, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(246, 48, 73, 0.12)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(246, 48, 73, 0.04)',
                  },
                }}
              >
                <ListItemIcon>
                  <Icon
                    sx={{
                      color: isActive ? 'primary.main' : 'text.secondary',
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'primary.main' : 'text.primary',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Settings at Bottom */}
      <List sx={{ px: 2, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleNavigation('/settings')}
            selected={location.pathname === '/settings'}
            sx={{
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: 'rgba(246, 48, 73, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(246, 48, 73, 0.12)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(246, 48, 73, 0.04)',
              },
            }}
          >
            <ListItemIcon>
              <Settings
                sx={{
                  color:
                    location.pathname === '/settings'
                      ? 'primary.main'
                      : 'text.secondary',
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{
                fontWeight: location.pathname === '/settings' ? 600 : 400,
                color:
                  location.pathname === '/settings'
                    ? 'primary.main'
                    : 'text.primary',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;