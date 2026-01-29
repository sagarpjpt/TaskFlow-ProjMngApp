import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useProject } from "../contexts/ProjectContext";
import { useTicket } from "../contexts/TicketContext";
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Grid,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Logout,
  AccountCircle,
  Dashboard as DashboardIcon,
  Add,
  FolderOpen,
  BugReport,
  ViewKanban,
  ViewModule,
  EmojiEmotions,
} from "@mui/icons-material";
import ProjectModal from "../components/ProjectModal";
import ProjectCard from "../components/ProjectCard";
import TicketModal from "../components/TicketModal";
import TicketCard from "../components/TicketCard";
import TicketFilters from "../components/TicketFilters";
import KanbanBoard from "../components/KanbanBoard";
import TicketDetailModal from "../components/TicketDetailModal";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    projects,
    currentProject,
    fetchProjects,
    deleteProject,
    setCurrentProject,
  } = useProject();
  const { tickets, filters, fetchTickets, deleteTicket } = useTicket();

  const [anchorEl, setAnchorEl] = useState(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketDetailOpen, setTicketDetailOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("");
  const [currentTab, setCurrentTab] = useState(0);
  const [ticketView, setTicketView] = useState("grid");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (currentTab === 1) {
      const fetchParams = currentProject
        ? { projectId: currentProject._id }
        : {};
      fetchTickets(fetchParams);
    }
  }, [currentTab, currentProject, filters, fetchTickets]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleProjectEdit = (project) => {
    setEditingProject(project);
    setProjectModalOpen(true);
  };

  const handleProjectDelete = (project) => {
    setItemToDelete(project);
    setDeleteType("project");
    setDeleteDialogOpen(true);
  };

  const handleProjectSelect = (project) => {
    setCurrentProject(project);
    setCurrentTab(1);
  };

  const handleTicketEdit = (ticket) => {
    setEditingTicket(ticket);
    setTicketModalOpen(true);
    setTicketDetailOpen(false);
  };

  const handleTicketDelete = (ticket) => {
    setItemToDelete(ticket);
    setDeleteType("ticket");
    setDeleteDialogOpen(true);
    setTicketDetailOpen(false);
  };

  const handleTicketView = (ticket) => {
    setViewingTicket(ticket);
    setTicketDetailOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteType === "project") {
        await deleteProject(itemToDelete._id);
        if (currentProject?._id === itemToDelete._id) {
          setCurrentProject(null);
        }
      } else {
        await deleteTicket(itemToDelete._id);
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleProjectModalClose = () => {
    setProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleTicketModalClose = () => {
    setTicketModalOpen(false);
    setEditingTicket(null);
  };

  const handleTicketDetailClose = () => {
    setTicketDetailOpen(false);
    setViewingTicket(null);
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setTicketView(newView);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#111F35" }}>
      <AppBar position="static">
        <Toolbar sx={{ py: 2, width: { xs: "100%", sm: "100%", md: "100%", lg: "91.666%" }, mx: "auto" }}>
          <DashboardIcon sx={{ mr: 2, fontSize: { xs: 24, md: 28 } }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontSize: { xs: "1.1rem", md: "1.3rem" },
              fontWeight: 700,
            }}
          >
            TaskFlow
          </Typography>
          <Typography
            variant="body2"
            sx={{ mr: 2, fontSize: { xs: "0.85rem", md: "0.95rem" } }}
          >
            {user?.name}
          </Typography>
          <IconButton size="large" onClick={handleMenu} color="inherit">
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <AccountCircle sx={{ mr: 1 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="xl"
        sx={{
          width: { xs: "100%", sm: "100%", md: "100%", lg: "91.666%" },
          mt: 4,
          mb: 4,
          px: { xs: 2, sm: 3, md: 4 },
          mx: "auto",
        }}
      >
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
              lineHeight: 1.25,
            }}
          >
            Welcome back, {user?.name}!
            <EmojiEmotions
              sx={{
                ml: 1,
                fontSize: { xs: 24, sm: 28, md: 32 },
                verticalAlign: "middle",
                color: "primary.main",
              }}
            />
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: { xs: "center", sm: "flex-end" },
            }}
          >
            {currentTab === 1 && (
              <ToggleButtonGroup
                value={ticketView}
                exclusive
                onChange={handleViewChange}
                size="small"
              >
                <ToggleButton value="grid">
                  <ViewModule sx={{ mr: 0.5 }} fontSize="small" />
                  Grid
                </ToggleButton>
                <ToggleButton value="kanban">
                  <ViewKanban sx={{ mr: 0.5 }} fontSize="small" />
                  Kanban
                </ToggleButton>
              </ToggleButtonGroup>
            )}
            {currentTab === 0 ? (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setProjectModalOpen(true)}
                sx={{
                  fontSize: { xs: "0.8rem", md: "0.95rem" },
                  px: { xs: 1.5, md: 2.5 },
                }}
              >
                New Project
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setTicketModalOpen(true)}
                sx={{
                  fontSize: { xs: "0.8rem", md: "0.95rem" },
                  px: { xs: 1.5, md: 2.5 },
                }}
              >
                New Ticket
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab
              icon={<FolderOpen />}
              label="Projects"
              iconPosition="start"
              sx={{ fontSize: { xs: "0.8rem", md: "0.95rem" } }}
            />
            <Tab
              icon={<BugReport />}
              label="Tickets"
              iconPosition="start"
              sx={{ fontSize: { xs: "0.8rem", md: "0.95rem" } }}
            />
          </Tabs>
        </Box>

        {currentTab === 0 && (
          <>
            {projects.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  bgcolor: "white",
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                <FolderOpen
                  sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No projects yet
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Create your first project to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setProjectModalOpen(true)}
                >
                  Create Project
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {projects.map((project) => (
                  <Grid item xs={12} sm={6} md={4} key={project._id}>
                    <ProjectCard
                      project={project}
                      onEdit={handleProjectEdit}
                      onDelete={handleProjectDelete}
                      onSelect={handleProjectSelect}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {currentTab === 1 && (
          <>
            {ticketView === "grid" && <TicketFilters />}

            {tickets.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  bgcolor: "white",
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                <BugReport
                  sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tickets yet
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  {currentProject
                    ? "Create your first ticket for this project"
                    : "Create a project first, then add tickets"}
                </Typography>
                {projects.length > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setTicketModalOpen(true)}
                  >
                    Create Ticket
                  </Button>
                )}
              </Box>
            ) : ticketView === "kanban" ? (
              <KanbanBoard
                onEditTicket={handleTicketEdit}
                onDeleteTicket={handleTicketDelete}
                onViewTicket={handleTicketView}
              />
            ) : (
              <Grid container spacing={2}>
                {tickets.map((ticket) => (
                  <Grid item xs={12} sm={6} md={4} key={ticket._id}>
                    <TicketCard
                      ticket={ticket}
                      onEdit={handleTicketEdit}
                      onDelete={handleTicketDelete}
                      onClick={handleTicketView}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Container>

      <ProjectModal
        open={projectModalOpen}
        onClose={handleProjectModalClose}
        project={editingProject}
      />

      <TicketModal
        open={ticketModalOpen}
        onClose={handleTicketModalClose}
        ticket={editingTicket}
        defaultProjectId={currentProject?._id}
      />

      <TicketDetailModal
        open={ticketDetailOpen}
        onClose={handleTicketDetailClose}
        ticket={viewingTicket}
        onEdit={handleTicketEdit}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {deleteType}? This action
            cannot be undone.
            {deleteType === "project" &&
              " All associated tickets will also be deleted."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
