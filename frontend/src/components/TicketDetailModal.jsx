import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  Avatar,
  TextField,
  Button,
  IconButton,
  Divider,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  BugReport,
  Star,
  CheckCircle,
  Build,
  Send,
  Edit,
  Delete,
} from "@mui/icons-material";
import { commentAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);

const TicketDetailModal = ({ open, onClose, ticket, onEdit }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && ticket) {
      fetchComments();
    }
  }, [open, ticket]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await commentAPI.getByTicket(ticket._id);
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await commentAPI.create(ticket._id, {
        text: newComment,
      });
      setComments([...comments, response.data]);
      setNewComment("");
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentAPI.delete(commentId);
      setComments(comments.filter((c) => c._id !== commentId));
      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  if (!ticket) return null;

  const priorityColors = {
    low: { color: "success" },
    medium: { color: "warning" },
    high: { color: "error" },
    critical: { color: "error" },
  };

  const statusColors = {
    todo: "default",
    "in-progress": "primary",
    done: "success",
  };

  const typeIcons = {
    bug: <BugReport />,
    feature: <Star />,
    task: <CheckCircle />,
    improvement: <Build />,
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {typeIcons[ticket.type]}
          <Typography variant="h6">
            #{ticket._id.slice(-6).toUpperCase()}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton onClick={() => onEdit(ticket)} size="small">
            <Edit />
          </IconButton>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" } }}
          >
            {ticket.title}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
            <Chip
              label={ticket.status.replace("-", " ")}
              size="small"
              color={statusColors[ticket.status]}
              sx={{ textTransform: "capitalize", fontWeight: 600 }}
            />
            <Chip
              label={ticket.priority}
              size="small"
              color={priorityColors[ticket.priority].color}
              sx={{ textTransform: "capitalize", fontWeight: 700 }}
            />
            <Chip
              label={ticket.type}
              size="small"
              variant="outlined"
              sx={{ textTransform: "capitalize", fontWeight: 600 }}
            />
          </Box>

          {ticket.tags && ticket.tags.length > 0 && (
            <Box sx={{ display: "flex", gap: 0.5, mb: 2, flexWrap: "wrap" }}>
              {ticket.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: { xs: "0.7rem", md: "0.8rem" } }}
                />
              ))}
            </Box>
          )}

          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, lineHeight: 1.6 }}
          >
            {ticket.description || "No description provided"}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              p: 2,
              bgcolor: "#f8fafc",
              borderRadius: 1,
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{
                  fontSize: { xs: "0.75rem", md: "0.85rem" },
                  fontWeight: 700,
                  mb: 0.5,
                  color: "#475569",
                }}
              >
                Assigned to
              </Typography>
              {ticket.assignee ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 0.5,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: "0.875rem",
                      bgcolor: "primary.main",
                      color: "white",
                      fontWeight: 700,
                    }}
                  >
                    {ticket.assignee.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      fontSize: { xs: "0.85rem", md: "0.95rem" },
                      color: "#1e293b",
                    }}
                  >
                    {ticket.assignee.name}
                  </Typography>
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: "0.85rem", md: "0.95rem" },
                    color: "#64748b",
                    fontStyle: "italic",
                  }}
                >
                  Unassigned
                </Typography>
              )}
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{
                  fontSize: { xs: "0.75rem", md: "0.85rem" },
                  fontWeight: 700,
                  mb: 0.5,
                  color: "#475569",
                }}
              >
                Created by
              </Typography>
              {ticket.creator && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 0.5,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: "0.875rem",
                      bgcolor: "primary.main",
                      color: "white",
                      fontWeight: 700,
                    }}
                  >
                    {ticket.creator.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      fontSize: { xs: "0.85rem", md: "0.95rem" },
                      color: "#1e293b",
                    }}
                  >
                    {ticket.creator.name}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{
                  fontSize: { xs: "0.75rem", md: "0.85rem" },
                  fontWeight: 700,
                  mb: 0.5,
                  color: "#475569",
                }}
              >
                Created
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  fontSize: { xs: "0.85rem", md: "0.95rem" },
                  color: "#1e293b",
                }}
              >
                {dayjs(ticket.createdAt).fromNow()}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontSize: { xs: "1rem", md: "1.1rem" },
              fontWeight: 700,
              color: "#1e293b",
            }}
          >
            Comments ({comments.length})
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : comments.length > 0 ? (
            <Box sx={{ mb: 2, maxHeight: 300, overflowY: "auto" }}>
              {comments.map((comment) => (
                <Paper
                  key={comment._id}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: "#ffffff",
                    border: "1px solid #e2e8f0",
                  }}
                  variant="outlined"
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: "0.875rem",
                          bgcolor: "primary.main",
                          color: "white",
                          fontWeight: 700,
                        }}
                      >
                        {comment.user?.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            fontSize: { xs: "0.85rem", md: "0.95rem" },
                            color: "#1e293b",
                          }}
                        >
                          {comment.user?.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: { xs: "0.7rem", md: "0.8rem" },
                            color: "#64748b",
                          }}
                        >
                          {dayjs(comment.createdAt).fromNow()}
                        </Typography>
                      </Box>
                    </Box>
                    {comment.user?._id === user?._id && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: "0.85rem", md: "0.95rem" },
                      lineHeight: 1.5,
                      color: "#334155",
                    }}
                  >
                    {comment.text}
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography
              variant="body2"
              sx={{
                py: 2,
                fontSize: { xs: "0.85rem", md: "0.95rem" },
                color: "#64748b",
                fontStyle: "italic",
              }}
            >
              No comments yet. Be the first to comment!
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  color: "#1e293b",
                },
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#ffffff",
                },
              }}
            />
            <Button
              variant="contained"
              endIcon={<Send />}
              onClick={handleAddComment}
              disabled={!newComment.trim() || submitting}
              sx={{
                alignSelf: "flex-end",
                fontSize: { xs: "0.85rem", md: "0.95rem" },
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              Send
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailModal;
