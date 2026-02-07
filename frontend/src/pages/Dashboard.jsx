import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  FolderOpen,
  BugReport,
  Add,
  TrendingUp,
  CheckCircle,
  EmojiEmotions,
} from "@mui/icons-material";
import { analyticsAPI } from "../services/api";
import StatsCard from "../components/common/StatsCard";
import AppLayout from "../components/layout/AppLayout";
import ProjectModal from "../components/ProjectModal";
import TicketModal from "../components/TicketModal";
import { useAuth } from "../contexts/AuthContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 60 seconds
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            Welcome back, {user?.name}!
            <EmojiEmotions
              sx={{
                fontSize: { xs: 24, sm: 28, md: 32 },
                color: "primary.main",
              }}
            />
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setProjectModalOpen(true)}
              sx={{ fontSize: { xs: "0.8rem", md: "0.95rem" } }}
            >
              New Project
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setTicketModalOpen(true)}
              sx={{ fontSize: { xs: "0.8rem", md: "0.95rem" } }}
            >
              New Ticket
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Projects"
              value={analytics?.projects?.total || 0}
              icon={FolderOpen}
              color="primary"
              subtitle={`${analytics?.projects?.active || 0} active`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Tickets"
              value={analytics?.tickets?.total || 0}
              icon={BugReport}
              color="secondary"
              subtitle={`${analytics?.tickets?.myAssigned || 0} assigned to you`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="In Progress"
              value={analytics?.tickets?.byStatus?.["in-progress"] || 0}
              icon={TrendingUp}
              color="warning"
              subtitle="Active tickets"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Completed"
              value={analytics?.tickets?.byStatus?.done || 0}
              icon={CheckCircle}
              color="success"
              subtitle="Done tickets"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Recent Activity */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {analytics?.recentActivity
                  ?.slice(0, 10)
                  .map((activity, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        "&:hover": { bgcolor: "action.hover" },
                        cursor: "pointer",
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          {activity.user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2" fontWeight={600}>
                              {activity.user?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {activity.type === "ticket_created"
                                ? "created ticket"
                                : "commented on"}
                            </Typography>
                            {activity.ticket?.project?.key && (
                              <Chip
                                label={activity.ticket.project.key}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: "0.7rem" }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" noWrap>
                              {activity.ticket?.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {dayjs(activity.timestamp).fromNow()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            </Paper>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Ticket Distribution
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">To Do</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {analytics?.tickets?.byStatus?.todo || 0}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      height: 8,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${((analytics?.tickets?.byStatus?.todo || 0) / (analytics?.tickets?.total || 1)) * 100}%`,
                        bgcolor: "info.main",
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">In Progress</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {analytics?.tickets?.byStatus?.["in-progress"] || 0}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      height: 8,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${((analytics?.tickets?.byStatus?.["in-progress"] || 0) / (analytics?.tickets?.total || 1)) * 100}%`,
                        bgcolor: "warning.main",
                      }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Done</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {analytics?.tickets?.byStatus?.done || 0}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      height: 8,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${((analytics?.tickets?.byStatus?.done || 0) / (analytics?.tickets?.total || 1)) * 100}%`,
                        bgcolor: "success.main",
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Priority Breakdown
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Chip label="Critical" size="small" color="error" />
                    <Typography variant="body2" fontWeight={600}>
                      {analytics?.tickets?.byPriority?.critical || 0}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Chip
                      label="High"
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {analytics?.tickets?.byPriority?.high || 0}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Chip label="Medium" size="small" color="warning" />
                    <Typography variant="body2" fontWeight={600}>
                      {analytics?.tickets?.byPriority?.medium || 0}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Chip label="Low" size="small" color="success" />
                    <Typography variant="body2" fontWeight={600}>
                      {analytics?.tickets?.byPriority?.low || 0}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <ProjectModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
      />

      <TicketModal
        open={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
      />
    </AppLayout>
  );
};

export default Dashboard;
