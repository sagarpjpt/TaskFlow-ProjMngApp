import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Topbar handleDrawerToggle={handleDrawerToggle} />
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - 260px)` },
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default AppLayout;