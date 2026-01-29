import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Link as MuiLink,
} from "@mui/material";
import { LockReset, ArrowBack } from "@mui/icons-material";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authAPI.forgotPassword({ email });
      setSuccess(true);
      toast.success("Password reset link sent to your email!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <LockReset
              sx={{
                fontSize: { xs: 48, md: 60 },
                color: "success.main",
                mb: 2,
              }}
            />
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              sx={{
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                lineHeight: 1.2,
              }}
            >
              Check Your Email
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              We've sent a password reset link to <strong>{email}</strong>
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
                fontSize: { xs: "0.85rem", md: "0.95rem" },
                lineHeight: 1.6,
              }}
            >
              Click the link in the email to reset your password. The link will
              expire in 1 hour.
            </Typography>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              startIcon={<ArrowBack />}
              sx={{
                fontSize: { xs: "0.85rem", md: "0.95rem" },
                fontWeight: 600,
              }}
            >
              Back to Login
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

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
                fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                lineHeight: 1.2,
              }}
            >
              Forgot Password?
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              Enter your email and we'll send you a reset link
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
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
              margin="normal"
              autoFocus
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
                mb: 2,
              }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <MuiLink
              component={Link}
              to="/login"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: { xs: "0.85rem", md: "0.95rem" },
                color: "primary.main",
                "&:hover": { color: "primary.dark" },
              }}
            >
              <ArrowBack sx={{ mr: 0.5, fontSize: 18 }} />
              Back to Login
            </MuiLink>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
