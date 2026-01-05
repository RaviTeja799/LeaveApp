# Leave Management System Backend

A voice-based hierarchical leave approval system for educational institutions.

## Features

- Voice message-based leave applications
- Multi-level approval workflow
- JWT-based authentication
- PostgreSQL database
- RESTful API design
- Mobile app ready

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb leave_management

# Run schema
psql -d leave_management -f database/schema.sql
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
```

### 4. Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Leave Management
- `POST /api/leaves/apply` - Submit leave application
- `GET /api/leaves/pending` - Get pending leaves for approval
- `POST /api/leaves/decision` - Approve/reject leave
- `GET /api/leaves/:leaveId/history` - Get leave approval history

## Database Schema

### Users Table
- Faculty, HODs, Deans, Registrars with different levels
- Level 1: Faculty, Level 2: HOD, Level 3: Dean, Level 4: Registrar

### Leave Applications Table
- Stores voice message URLs and current approval level
- Status: PENDING, APPROVED, REJECTED

### Leave Approvals Table
- Tracks complete approval history with remarks

## Approval Workflow

1. Faculty submits leave with voice message (Level 1)
2. Forwards to HOD for approval (Level 2)
3. If approved, forwards to Dean (Level 3)
4. If approved, forwards to Registrar (Level 4)
5. Final approval or rejection at any level

## Mobile Integration

This backend is designed for mobile app integration:
- RESTful APIs work with React Native, Flutter, native apps
- JWT authentication for secure mobile sessions
- Voice blob URL support for mobile audio uploads
- JSON responses optimized for mobile consumption

## Testing

Use tools like Postman or curl to test the APIs:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.faculty@university.edu","password":"password"}'

# Apply for leave (with token)
curl -X POST http://localhost:3000/api/leaves/apply \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"voiceBlobUrl":"https://example.com/audio.wav","leaveType":"sick"}'
```