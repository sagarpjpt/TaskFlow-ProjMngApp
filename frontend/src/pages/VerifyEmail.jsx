import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../services/api";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { VerifiedUser, Refresh } from "@mui/icons-material";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(location.state?.email || "");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authAPI.verifyEmail({ email, otp });
      toast.success("Email verified successfully!");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setResending(true);

    try {
      await authAPI.resendOTP({ email });
      toast.success("New OTP sent to your email!");
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
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
            <VerifiedUser
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
              Verify Your Email
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              We've sent a 6-digit code to
            </Typography>
            <Typography
              variant="body1"
              fontWeight="bold"
              color="primary"
              sx={{ mt: 1, fontSize: { xs: "0.95rem", md: "1.05rem" } }}
            >
              {email}
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

          <form onSubmit={handleVerify}>
            <TextField
              fullWidth
              label="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtp(value);
                setError("");
              }}
              required
              margin="normal"
              autoFocus
              inputProps={{
                maxLength: 6,
                style: {
                  fontSize: "24px",
                  textAlign: "center",
                  letterSpacing: "8px",
                  fontWeight: 700,
                },
              }}
              helperText="Check your email inbox or spam folder"
              sx={{
                mb: 2,
                "& .MuiInputBase-input": {
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || otp.length !== 6}
              sx={{
                py: { xs: 1.25, md: 1.75 },
                fontSize: { xs: "0.9rem", md: "1rem" },
                fontWeight: 700,
                mb: 2,
              }}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontSize: { xs: "0.85rem", md: "0.95rem" } }}
            >
              Didn't receive the code?
            </Typography>
            <Button
              variant="text"
              startIcon={<Refresh />}
              onClick={handleResendOTP}
              disabled={resending || countdown > 0}
              sx={{ mt: 1, fontSize: { xs: "0.8rem", md: "0.9rem" } }}
            >
              {countdown > 0
                ? `Resend in ${countdown}s`
                : resending
                  ? "Sending..."
                  : "Resend OTP"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyEmail;
