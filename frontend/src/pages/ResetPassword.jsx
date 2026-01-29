import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authAPI } from "../services/api";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff, LockReset } from "@mui/icons-material";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(token, { password: formData.password });
      toast.success("Password reset successful!");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #F63049 0%, #8A244B 100%)",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          width: {
            xs: "100%",
            sm: "100%",
            md: "100%",
            lg: "91.666%",
          },
          mx: "auto",
        }}
      >
        <Paper
          elevation={24}
          sx={{ p: { xs: 3, sm: 4, md: 5 }, borderRadius: 2 }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <LockReset
              sx={{
                fontSize: { xs: 48, md: 60 },
                color: "primary.main",
                mb: 2,
              }}
            />
            <Typography
              variant="h4"
              fontWeight="bold"
              gutterBottom
              sx={{
                fontSize: {
                  xs: "1.75rem",
                  sm: "2rem",
                  md: "2.25rem",
                },
                lineHeight: 1.2,
              }}
            >
              Reset Password
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              Enter your new password
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                fontSize: { xs: "0.85rem", md: "0.95rem" },
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="New Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              autoFocus
              helperText="Minimum 6 characters"
              sx={{
                mb: 2,
                "& .MuiInputBase-input": {
                  fontSize: { xs: "0.9rem", md: "1rem" },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              margin="normal"
              sx={{
                mb: 3,
                "& .MuiInputBase-input": {
                  fontSize: { xs: "0.9rem", md: "1rem" },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: { xs: 1.25, md: 1.75 },
                fontSize: { xs: "0.9rem", md: "1rem" },
                fontWeight: 700,
              }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPassword;
