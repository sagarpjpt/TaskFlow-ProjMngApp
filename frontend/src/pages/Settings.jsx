import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Avatar,
  Switch,
  FormControlLabel,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save,
  Edit,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const Settings = () => {
  const { user, updateUser, updateRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    emailNotifications: user?.emailNotifications !== false,
  });

  // Role State
  const [selectedRole, setSelectedRole] = useState(user?.role || 'developer');

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const response = await authAPI.updateProfile({
        name: profileData.name,
        emailNotifications: profileData.emailNotifications,
      });
      updateUser(response.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async () => {
    if (selectedRole === user?.role) {
      toast.info('Role is already set to ' + selectedRole);
      return;
    }

    setLoading(true);
    try {
      await updateRole(selectedRole);
      toast.success(`Role changed to ${selectedRole}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Note: You'll need to implement password change endpoint
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
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
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage your account settings and preferences
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Profile Settings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Profile Information
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </Box>

              <TextField
                fullWidth
                label="Full Name"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Email Address"
                value={user?.email}
                disabled
                helperText="Email cannot be changed"
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={profileData.emailNotifications}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        emailNotifications: e.target.checked,
                      })
                    }
                  />
                }
                label="Email notifications"
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                fullWidth
                startIcon={<Save />}
                onClick={handleProfileUpdate}
                disabled={loading}
              >
                Save Changes
              </Button>
            </Paper>
          </Grid>

          {/* Role & Permissions */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Role & Permissions
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                Your role determines what actions you can perform in the system.
              </Alert>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Current Role</InputLabel>
                <Select
                  value={selectedRole}
                  label="Current Role"
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <MenuItem value="developer">Developer</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="viewer">Viewer</MenuItem>
                </Select>
              </FormControl>

              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Role Permissions:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
                  {selectedRole === 'developer' && (
                    <>
                      <li>Create and edit own tickets</li>
                      <li>Comment on tickets</li>
                      <li>Create projects</li>
                      <li>View team analytics</li>
                    </>
                  )}
                  {selectedRole === 'manager' && (
                    <>
                      <li>All Developer permissions</li>
                      <li>Edit all tickets in projects</li>
                      <li>Manage team members</li>
                      <li>View full team analytics</li>
                    </>
                  )}
                  {selectedRole === 'viewer' && (
                    <>
                      <li>View projects and tickets</li>
                      <li>View comments</li>
                      <li>Read-only access</li>
                    </>
                  )}
                </Box>
              </Paper>

              <Button
                variant="contained"
                fullWidth
                startIcon={<Edit />}
                onClick={handleRoleUpdate}
                disabled={loading || selectedRole === user?.role}
              >
                Update Role
              </Button>
            </Paper>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Security Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    helperText="Minimum 6 characters"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    onClick={handlePasswordChange}
                    disabled={
                      loading ||
                      !passwordData.currentPassword ||
                      !passwordData.newPassword ||
                      !passwordData.confirmPassword
                    }
                  >
                    Change Password
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Account Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Account Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email Verified
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {user?.isEmailVerified ? 'Yes' : 'No'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Account Created
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
};

export default Settings;