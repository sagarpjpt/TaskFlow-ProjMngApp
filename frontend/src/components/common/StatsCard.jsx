import { Card, CardContent, Typography, Box } from '@mui/material';

const StatsCard = ({ title, value, icon: Icon, color = 'primary', subtitle }) => {
  return (
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: { xs: 48, md: 56 },
              height: { xs: 48, md: 56 },
              borderRadius: 2,
              bgcolor: `${color}.main`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.9,
            }}
          >
            <Icon sx={{ fontSize: { xs: 28, md: 32 }, color: 'white' }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;