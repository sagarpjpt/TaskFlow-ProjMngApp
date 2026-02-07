import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  MoreVert,
  Edit,
  Delete,
  BugReport,
  Star,
  CheckCircle,
  Build,
} from "@mui/icons-material";
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const TicketCard = ({ ticket, onEdit, onDelete, onClick }) => {
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
    onEdit(ticket);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    handleMenuClose();
    onDelete(ticket);
  };

  const priorityColors = {
    low: { color: "success", label: "Low" },
    medium: { color: "warning", label: "Medium" },
    high: { color: "error", label: "High" },
    critical: { color: "error", label: "Critical" },
  };

  const statusColors = {
    todo: "default",
    "in-progress": "primary",
    done: "success",
  };

  const typeIcons = {
    bug: <BugReport sx={{ fontSize: 18 }} />,
    feature: <Star sx={{ fontSize: 18 }} />,
    task: <CheckCircle sx={{ fontSize: 18 }} />,
    improvement: <Build sx={{ fontSize: 18 }} />,
  };

  return (
    <Card
      sx={{
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-2px)",
        },
        borderLeft: `4px solid ${
          ticket.priority === "critical" || ticket.priority === "high"
            ? "#f44336"
            : ticket.priority === "medium"
              ? "#ff9800"
              : "#4caf50"
        }`,
      }}
      onClick={() => onClick(ticket)}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            mb: 2,
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {typeIcons[ticket.type]}
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.75rem", md: "0.875rem" },
                fontWeight: 600,
              }}
            >
              {ticket.project?.key}-{ticket.ticketNumber}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVert fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            <MenuItem onClick={handleEdit}>
              <Edit sx={{ mr: 1, fontSize: 20 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
              <Delete sx={{ mr: 1, fontSize: 20 }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 1.5,
            fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.25rem" },
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {ticket.title}
        </Typography>

        {ticket.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              fontSize: { xs: "0.8rem", md: "0.875rem" },
              lineHeight: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {ticket.description}
          </Typography>
        )}

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <Chip
            label={ticket.status.replace("-", " ")}
            size="small"
            color={statusColors[ticket.status]}
            sx={{
              textTransform: "capitalize",
              fontSize: { xs: "0.7rem", md: "0.75rem" },
              fontWeight: 600,
            }}
          />
          <Chip
            label={ticket.priority}
            size="small"
            color={priorityColors[ticket.priority].color}
            sx={{
              textTransform: "capitalize",
              fontWeight: 700,
              fontSize: { xs: "0.7rem", md: "0.75rem" },
            }}
          />
          <Chip
            label={ticket.type}
            size="small"
            variant="outlined"
            sx={{
              textTransform: "capitalize",
              fontSize: { xs: "0.7rem", md: "0.75rem" },
              fontWeight: 600,
            }}
          />
        </Box>

        {ticket.tags && ticket.tags.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
            {ticket.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {ticket.assignee ? (
              <Tooltip title={ticket.assignee.name}>
                <Avatar
                  sx={{
                    width: { xs: 24, md: 28 },
                    height: { xs: 24, md: 28 },
                    fontSize: { xs: "0.75rem", md: "0.875rem" },
                  }}
                >
                  {ticket.assignee.name.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            ) : (
              <Chip
                label="Unassigned"
                size="small"
                variant="outlined"
                sx={{ fontSize: { xs: "0.65rem", md: "0.75rem" } }}
              />
            )}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.7rem", md: "0.8rem" } }}
          >
            {dayjs(ticket.createdAt).fromNow()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TicketCard;
