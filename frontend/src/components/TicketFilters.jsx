import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
} from "@mui/material";
import { FilterList, Clear } from "@mui/icons-material";
import { useTicket } from "../contexts/TicketContext";
import { useState, useEffect } from "react";
import { authAPI } from "../services/api";

const TicketFilters = () => {
  const { filters, setFilters, clearFilters, fetchTickets } = useTicket();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await authAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    clearFilters();
    fetchTickets();
  };

  const handleSearch = (e) => {
    handleFilterChange("search", e.target.value);
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1.5, sm: 2, md: 3 },
          flexWrap: "wrap",
        }}
      >
        <FilterList color="action" sx={{ fontSize: { xs: 20, md: 24 } }} />

        <TextField
          label="Search tickets"
          size="small"
          value={filters.search}
          onChange={handleSearch}
          sx={{
            minWidth: { xs: "100%", sm: 200, md: 250 },
            flexGrow: { xs: 0, sm: 1 },
            fontSize: { xs: "0.875rem", md: "0.95rem" },
          }}
          placeholder="Search by title..."
        />

        <FormControl size="small" sx={{ minWidth: { xs: 120, md: 150 } }}>
          <InputLabel sx={{ fontSize: { xs: "0.8rem", md: "0.9rem" } }}>
            Status
          </InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => handleFilterChange("status", e.target.value)}
            sx={{ fontSize: { xs: "0.8rem", md: "0.9rem" } }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="todo">To Do</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: 120, md: 150 } }}>
          <InputLabel sx={{ fontSize: { xs: "0.8rem", md: "0.9rem" } }}>
            Priority
          </InputLabel>
          <Select
            value={filters.priority}
            label="Priority"
            onChange={(e) => handleFilterChange("priority", e.target.value)}
            sx={{ fontSize: { xs: "0.8rem", md: "0.9rem" } }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: 120, md: 150 } }}>
          <InputLabel sx={{ fontSize: { xs: "0.8rem", md: "0.9rem" } }}>
            Type
          </InputLabel>
          <Select
            value={filters.type}
            label="Type"
            onChange={(e) => handleFilterChange("type", e.target.value)}
            sx={{ fontSize: { xs: "0.8rem", md: "0.9rem" } }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="bug">Bug</MenuItem>
            <MenuItem value="feature">Feature</MenuItem>
            <MenuItem value="task">Task</MenuItem>
            <MenuItem value="improvement">Improvement</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: 120, md: 150 } }}>
          <InputLabel sx={{ fontSize: { xs: "0.8rem", md: "0.9rem" } }}>
            Assignee
          </InputLabel>
          <Select
            value={filters.assignee}
            label="Assignee"
            onChange={(e) => handleFilterChange("assignee", e.target.value)}
            sx={{ fontSize: { xs: "0.8rem", md: "0.9rem" } }}
          >
            <MenuItem value="">All</MenuItem>
            {users.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={handleClearFilters}
          size="small"
          sx={{
            fontSize: { xs: "0.75rem", md: "0.85rem" },
            px: { xs: 1, md: 2 },
          }}
        >
          Clear
        </Button>
      </Box>
    </Paper>
  );
};

export default TicketFilters;
