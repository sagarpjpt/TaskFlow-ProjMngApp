import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { useProject } from "../contexts/ProjectContext";

const ProjectModal = ({ open, onClose, project = null }) => {
  const { createProject, updateProject, loading } = useProject();
  const isEdit = !!project;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      key: ''
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        title: project.title || "",
        description: project.description || "",
        key: project.key || '',
      });
    } else {
      reset({
        title: "",
        key: '',
        description: "",
      });
    }
  }, [project, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateProject(project._id, data);
      } else {
        await createProject(data);
      }
      reset();
      onClose();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? "Edit Project" : "Create New Project"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Project Key"
              {...register("key", {
                required: "Key is required",
                pattern: {
                  value: /^[A-Z]{2,10}$/,
                  message: "Key must be 2-10 uppercase letters",
                },
              })}
              error={!!errors.key}
              helperText={
                errors.key?.message ||
                "e.g., PROJ, BUG (2-10 uppercase letters)"
              }
              fullWidth
              inputProps={{ style: { textTransform: "uppercase" } }}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
              }}
            />
            <TextField
              label="Project Title"
              {...register("title", {
                required: "Title is required",
                maxLength: {
                  value: 100,
                  message: "Title cannot exceed 100 characters",
                },
              })}
              error={!!errors.title}
              helperText={errors.title?.message}
              fullWidth
              autoFocus
            />
            <TextField
              label="Description"
              {...register("description", {
                maxLength: {
                  value: 500,
                  message: "Description cannot exceed 500 characters",
                },
              })}
              error={!!errors.description}
              helperText={errors.description?.message}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProjectModal;
