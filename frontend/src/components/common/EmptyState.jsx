import { Box, Typography, Button } from '@mui/material';

const EmptyState = ({ icon: Icon, title, description, action, actionLabel }) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: { xs: 6, md: 8 },
        px: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <Icon
        sx={{
          fontSize: { xs: 64, md: 80 },
          color: 'text.secondary',
          mb: 2,
          opacity: 0.5,
        }}
      />
      <Typography
        variant="h6"
        color="text.secondary"
        gutterBottom
        sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3, fontSize: { xs: '0.875rem', md: '1rem' } }}
      >
        {description}
      </Typography>
      {action && (
        <Button
          variant="contained"
          onClick={action}
          sx={{ fontSize: { xs: '0.875rem', md: '0.95rem' } }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;