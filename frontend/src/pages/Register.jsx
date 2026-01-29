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
import { Visibility, VisibilityOff, PersonAdd } from "@mui/icons-material";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);

      toast.success(
        "Registration successful! Check your email for verification code.",
      );
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
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
              Create your account
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
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
              autoComplete="name"
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
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
              autoComplete="email"
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
              autoComplete="new-password"
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
              autoComplete="new-password"
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
              startIcon={<PersonAdd />}
              sx={{
                py: { xs: 1.25, md: 1.75 },
                fontSize: { xs: "0.9rem", md: "1rem" },
                fontWeight: 700,
                mb: 2,
              }}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.8rem", md: "0.9rem" } }}
            >
              Already have an account?{" "}
              <MuiLink
                component={Link}
                to="/login"
                sx={{
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: { xs: "0.8rem", md: "0.9rem" },
                }}
              >
                Sign in
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
