import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
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
import toast from "react-hot-toast";
import { useTicket } from "../contexts/TicketContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const KanbanBoard = ({ onEditTicket, onDeleteTicket, onViewTicket }) => {
  const { tickets, updateTicketStatus } = useTicket();
  const [columns, setColumns] = useState({
    todo: [],
    "in-progress": [],
    done: [],
  });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const grouped = {
      todo: tickets.filter((t) => t.status === "todo"),
      "in-progress": tickets.filter((t) => t.status === "in-progress"),
      done: tickets.filter((t) => t.status === "done"),
    };
    setColumns(grouped);
  }, [tickets]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const ticket = tickets.find((t) => String(t._id) === draggableId);
    if (!ticket) return;

    const sourceColumn = [...columns[source.droppableId]];
    const destColumn = [...columns[destination.droppableId]];

    if (source.droppableId === destination.droppableId) {
      const [removed] = sourceColumn.splice(source.index, 1);
      sourceColumn.splice(destination.index, 0, removed);
      setColumns({ ...columns, [source.droppableId]: sourceColumn });
    } else {
      const [removed] = sourceColumn.splice(source.index, 1);
      destColumn.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      });

      try {
        await updateTicketStatus(draggableId, destination.droppableId);
      } catch (error) {
        console.error("Failed to update ticket status:", error);
        toast.error(
          error.response?.data?.message || "Failed to update ticket status",
        );
        const revertColumns = {
          ...columns,
          [source.droppableId]: [...columns[source.droppableId]],
          [destination.droppableId]: [...columns[destination.droppableId]],
        };
        setColumns(revertColumns);
      }
    }
  };
  
  const handleMenuClick = (event, ticket) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedTicket(ticket);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTicket(null);
  };

  const handleEdit = () => {
    if (selectedTicket) {
      onEditTicket(selectedTicket);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedTicket) {
      onDeleteTicket(selectedTicket);
    }
    handleMenuClose();
  };

  const columnConfig = {
    todo: { title: "To Do", color: "#94a3b8" },
    "in-progress": { title: "In Progress", color: "#3b82f6" },
    done: { title: "Done", color: "#10b981" },
  };

  const priorityColors = {
    low: { color: "success", label: "Low" },
    medium: { color: "warning", label: "Medium" },
    high: { color: "error", label: "High" },
    critical: { color: "error", label: "Critical" },
  };

  const typeIcons = {
    bug: <BugReport sx={{ fontSize: 16 }} />,
    feature: <Star sx={{ fontSize: 16 }} />,
    task: <CheckCircle sx={{ fontSize: 16 }} />,
    improvement: <Build sx={{ fontSize: 16 }} />,
  };

  return (
    <Box
      sx={{
        height: {
          xs: "calc(100vh - 200px)",
          sm: "calc(100vh - 220px)",
          md: "calc(100vh - 250px)",
        },
        overflow: "hidden",
      }}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, sm: 1.5, md: 2 },
            height: "100%",
            overflowX: { xs: "auto", md: "visible" },
          }}
        >
          {Object.entries(columnConfig).map(([columnId, config]) => (
            <Paper
              key={columnId}
              sx={{
                flex: 1,
                p: { xs: 1.5, sm: 2, md: 2.5 },
                bgcolor: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                minWidth: { xs: 280, sm: 300, md: 320 },
              }}
              elevation={0}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                  pb: 1.5,
                  borderBottom: `3px solid ${config.color}`,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: "0.95rem", md: "1.1rem" },
                    color: "#1e293b",
                  }}
                >
                  {config.title}
                </Typography>
                <Chip
                  label={columns[columnId]?.length || 0}
                  size="small"
                  sx={{
                    bgcolor: config.color,
                    color: "white",
                    fontWeight: 600,
                    fontSize: { xs: "0.7rem", md: "0.8rem" },
                  }}
                />
              </Box>

              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      flexGrow: 1,
                      overflowY: "auto",
                      bgcolor: snapshot.isDraggingOver
                        ? "#e2e8f0"
                        : "transparent",
                      borderRadius: 1,
                      transition: "background-color 0.2s",
                      minHeight: 100,
                      p: 1,
                    }}
                  >
                    {columns[columnId]?.map((ticket, index) => (
                      <Draggable
                        key={ticket._id}
                        draggableId={String(ticket._id)}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              mb: 2,
                              cursor: "grab",
                              bgcolor: "white",
                              boxShadow: snapshot.isDragging ? 4 : 1,
                              transform: snapshot.isDragging
                                ? "rotate(3deg)"
                                : "none",
                              transition: "box-shadow 0.2s",
                              "&:hover": { boxShadow: 3 },
                              "&:active": { cursor: "grabbing" },
                            }}
                            onClick={() => onViewTicket(ticket)}
                          >
                            <CardContent
                              sx={{ p: 2, "&:last-child": { pb: 2 } }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "start",
                                  mb: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <Box sx={{ color: "#0f172a" }}>
                                    {typeIcons[ticket.type]}
                                  </Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#64748b",
                                      fontWeight: 600,
                                      fontSize: { xs: "0.7rem", md: "0.8rem" },
                                    }}
                                  >
                                    {ticket.project?.key}-{ticket.ticketNumber}
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuClick(e, ticket)}
                                  sx={{ ml: 1 }}
                                >
                                  <MoreVert fontSize="small" />
                                </IconButton>
                              </Box>

                              <Typography
                                variant="body2"
                                fontWeight={700}
                                sx={{
                                  mb: 1,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  color: "#1e293b",
                                  fontSize: { xs: "0.85rem", md: "0.95rem" },
                                }}
                              >
                                {ticket.title}
                              </Typography>

                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 0.5,
                                  mb: 1,
                                  flexWrap: "wrap",
                                }}
                              >
                                <Chip
                                  label={ticket.priority}
                                  size="small"
                                  color={priorityColors[ticket.priority].color}
                                  sx={{
                                    height: 20,
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    color: "white",
                                  }}
                                />
                                {ticket.tags?.slice(0, 2).map((tag) => (
                                  <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      height: 20,
                                      fontSize: "0.7rem",
                                      borderColor: "#cbd5e1",
                                      color: "#475569",
                                    }}
                                  />
                                ))}
                              </Box>

                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mt: 1,
                                }}
                              >
                                {ticket.assignee ? (
                                  <Tooltip title={ticket.assignee.name}>
                                    <Avatar
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        fontSize: "0.75rem",
                                        bgcolor: "primary.main",
                                        color: "white",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {ticket.assignee.name
                                        .charAt(0)
                                        .toUpperCase()}
                                    </Avatar>
                                  </Tooltip>
                                ) : (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#94a3b8",
                                      fontStyle: "italic",
                                      fontSize: { xs: "0.7rem", md: "0.8rem" },
                                    }}
                                  >
                                    Unassigned
                                  </Typography>
                                )}
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#64748b",
                                    fontSize: { xs: "0.7rem", md: "0.8rem" },
                                  }}
                                >
                                  {dayjs(ticket.createdAt).fromNow()}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Paper>
          ))}
        </Box>
      </DragDropContext>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
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
  );
};

export default KanbanBoard;
