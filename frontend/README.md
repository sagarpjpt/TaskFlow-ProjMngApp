# TaskFlow Frontend

Professional React frontend for TaskFlow Project Management Application.

## Features

###  Authentication System
- **Login** - Sign in with email/password
- **Register** - Create new account
- **Email Verification** - OTP-based verification (6-digit code)
- **Forgot Password** - Request password reset link
- **Reset Password** - Set new password via email link
- **Protected Routes** - Auto-redirect to login if not authenticated

###  UI/UX Features
- Material-UI components (professional design)
- Responsive layout (mobile-friendly)
- Toast notifications for user feedback
- Loading states on all actions
- Form validation
- Password visibility toggle
- Auto-redirect after authentication
- Gradient backgrounds

###  State Management
- React Context for global auth state
- Persistent login (localStorage)
- Token-based authentication
- Auto token refresh on page reload

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool (fast!)
- **Material-UI (MUI)** - Component library
- **React Router v6** - Navigation
- **Axios** - HTTP requests
- **React Hook Form** - Form management (ready for Day 4-5)
- **React Hot Toast** - Notifications
- **Day.js** - Date formatting (ready for tickets)


## Usage Flow

### 1. Registration Flow

1. Visit http://localhost:3000/register
2. Fill in name, email, password
3. Click "Sign Up"
4. Redirected to email verification page
5. Check email for 6-digit OTP
6. Enter OTP and verify
7. Redirected to login

### 2. Login Flow

1. Visit http://localhost:3000/login
2. Enter email and password
3. Click "Sign In"
4. If email not verified → Redirect to verification
5. If verified → Redirect to dashboard

### 3. Password Reset Flow

1. Click "Forgot password?" on login page
2. Enter your email
3. Click "Send Reset Link"
4. Check email for reset link
5. Click link (opens reset password page)
6. Enter new password
7. Click "Reset Password"
8. Redirected to login with new password

### 4. Email Verification

- Automatically triggered after registration
- Can resend OTP after 60 seconds
- OTP expires in 10 minutes
- Shows countdown timer

## Authentication State

via React Context:

```javascript
const { user, isAuthenticated, login, logout, loading } = useAuth();

// user object contains:
{
  _id: "...",
  name: "Shivam",
  email: "sagar@example.com",
  role: "developer",
  isEmailVerified: true,
  emailNotifications: true
}
```

## Pages Overview

### Login (`/login`)
- Email/password form
- Password visibility toggle
- "Forgot password?" link
- "Sign up" link
- Auto-redirect if already logged in

### Register (`/register`)
- Name, email, password, confirm password
- Client-side validation
- Password strength requirement (6+ chars)
- Auto-redirect to email verification

### Verify Email (`/verify-email`)
- 6-digit OTP input
- Large centered input field
- Resend OTP button (60s cooldown)
- Shows email address
- Auto-redirect on success

### Forgot Password (`/forgot-password`)
- Email input
- Success message with instructions
- Link back to login

### Reset Password (`/reset-password/:token`)
- New password input
- Confirm password
- Password visibility toggle
- Token validation
- Auto-redirect to login on success

### Dashboard (`/dashboard`)
- Protected route (requires auth)
- Shows welcome message
- Displays user info
- Logout functionality
- Placeholder for projects/tickets (Day 4-5)

## Security Features

-  Token stored in localStorage (secure)
-  Auto logout on token expiration
-  Protected routes with guards
-  Password visibility toggle
-  HTTPS ready (for production)
-  XSS protection (React default)
-  CSRF protection (via tokens)