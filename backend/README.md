# TaskFLow-ProjMng Backend API

Production-ready REST API for a TaskFlow a Bug/Issue Tracking application built with Node.js, Express, and MongoDB.

## Features

-  JWT-based authentication with bcrypt password hashing
-  **Email verification with OTP (NEW)**
-  **Forgot password with reset link (NEW)**
-  **Automated email notifications (NEW)**
  - Ticket assignments
  - Status changes
  - New comments
  - Project invitations
-  Project management with team collaboration
-  Ticket/issue creation and tracking
-  Kanban board status management (To Do, In Progress, Done)
-  Threaded comments on tickets
-  Advanced filtering and search capabilities
-  Role-based access control
-  Secure API with Helmet and CORS

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (sends OTP email)
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend verification OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password with token
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update user profile & notification settings (protected)
- `GET /api/auth/users` - Get all users (protected)

### Projects
- `POST /api/projects` - Create project (protected)
- `GET /api/projects` - Get user's projects (protected)
- `GET /api/projects/:id` - Get project by ID (protected)
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Delete project (protected)
- `POST /api/projects/:id/members` - Add team member (protected)
- `DELETE /api/projects/:id/members` - Remove team member (protected)

### Tickets
- `POST /api/tickets` - Create ticket (protected)
- `GET /api/tickets` - Get tickets with filters (protected)
- `GET /api/tickets/:id` - Get ticket by ID (protected)
- `PUT /api/tickets/:id` - Update ticket (protected)
- `DELETE /api/tickets/:id` - Delete ticket (protected)
- `PATCH /api/tickets/:id/status` - Update ticket status (protected)

### Comments
- `POST /api/comments/ticket/:ticketId` - Create comment (protected)
- `GET /api/comments/ticket/:ticketId` - Get ticket comments (protected)
- `PUT /api/comments/:id` - Update comment (protected)
- `DELETE /api/comments/:id` - Delete comment (protected)

## Query Parameters for Tickets

- `projectId` - Filter by project
- `status` - Filter by status (todo, in-progress, done)
- `priority` - Filter by priority (low, medium, high, critical)
- `assignee` - Filter by assignee user ID
- `type` - Filter by type (bug, feature, task, improvement)
- `search` - Search in title and description

Example:
```
GET /api/tickets?projectId=123&status=in-progress&priority=high&search=login
```

## Email Notifications

The system automatically sends emails for:

1. **Registration** - 6-digit OTP for email verification (expires in 10 minutes)
2. **Password Reset** - Secure link with token (expires in 1 hour)
3. **Ticket Assignment** - When a ticket is assigned to a user
4. **Status Changes** - When ticket status changes (to assignee only)
5. **New Comments** - To ticket creator and assignee
6. **Project Invitations** - When added to a project team

Users can control notification preferences via profile settings.


## Author

Shivam Prajapati
