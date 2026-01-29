import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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
  Link as MuiLink,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(formData);

      if (!response.isEmailVerified) {
        toast.success("Login successful! Please verify your email.");
        navigate("/verify-email", { state: { email: formData.email } });
      } else {
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
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
          width: { xs: "100%", sm: "100%", md: "100%", lg: "91.666%" },
          mx: "auto",
        }}
      >
        <Paper
          elevation={24}
          sx={{ p: { xs: 3, sm: 4, md: 5 }, borderRadius: 2 }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="primary"
              gutterBottom
              sx={{
                fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                lineHeight: 1.2,
              }}
            >
              TaskFlow
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              Sign in to your account
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, fontSize: { xs: "0.85rem", md: "0.95rem" } }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
              autoComplete="email"
              autoFocus
              sx={{
                mb: 2,
                "& .MuiInputBase-input": {
                  fontSize: { xs: "0.9rem", md: "1rem" },
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              autoComplete="current-password"
              sx={{
                mb: 1,
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

            <Box sx={{ textAlign: "right", mt: 2, mb: 3 }}>
              <MuiLink
                component={Link}
                to="/forgot-password"
                variant="body2"
                sx={{
                  textDecoration: "none",
                  fontSize: { xs: "0.8rem", md: "0.9rem" },
                  fontWeight: 600,
                }}
              >
                Forgot password?
              </MuiLink>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={<LoginIcon />}
              sx={{
                py: { xs: 1.25, md: 1.75 },
                fontSize: { xs: "0.9rem", md: "1rem" },
                fontWeight: 700,
                mb: 2,
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.8rem", md: "0.9rem" } }}
            >
              Don't have an account?{" "}
              <MuiLink
                component={Link}
                to="/register"
                sx={{
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: { xs: "0.8rem", md: "0.9rem" },
                }}
              >
                Sign up
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
