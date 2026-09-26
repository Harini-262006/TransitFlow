# 🚍 TransitFlow — Intelligent Shift Management System

TransitFlow is a full-stack, enterprise-grade shift and fleet scheduling platform tailored for bus transit depots. It automates roster generation, crew assignment, one-touch attendance logging, duty issue reporting, shift swaps, and leave management workflows across three specialized roles: **Manager**, **Driver**, and **Conductor**.

---

## 📋 Table of Contents
- [Key Features](#-key-features)
- [User Roles & Portals](#-user-roles--portals)
  - [1. Transport Manager](#1-transport-manager)
  - [2. Bus Driver](#2-bus-driver)
  - [3. Conductor](#3-conductor)
- [Core Workflows](#-core-workflows)
  - [Leave Application & Manager Approval](#leave-application--manager-approval)
  - [Smart Shift & Crew Assignment](#smart-shift--crew-assignment)
  - [Shift Exchange & Duty Issue Reporting](#shift-exchange--duty-issue-reporting)
- [Technology Stack](#-technology-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Running Concurrently](#running-concurrently)
- [API Overview](#-api-overview)
- [Security & Best Practices](#-security--best-practices)

---

## ✨ Key Features
- **Role-Based Authentication**: Secure JWT-powered authentication with auto-routing to Manager, Driver, or Conductor dashboards.
- **Dynamic Duty Rostering**: Interactive schedule views with automatic overlap and conflict detection.
- **Smart Assignment Engine**: Algorithmic driver and conductor recommendation engine evaluating active leave statuses and daily shift limits.
- **End-to-End Leave Workflow**: Conflict-aware leave submissions, shift impact calculations, and single-click approval/rejection.
- **One-Touch Attendance Logging**: Instant terminal check-in timestamping synchronized to depot backend servers.
- **Fleet & Maintenance Tracking**: Live bus health monitoring and incident reporting with priority indicators.
- **Shift Exchange System**: Peer-to-peer shift swap requests with manager oversight and auto-reassignment.

---

## 👥 User Roles & Portals

### 1. Transport Manager
- **Fleet & Crew Roster Overview**: Real-time stats on scheduled shifts, active buses, drivers on duty, and pending requests.
- **Shift Scheduling & Assignment**: Create daily/weekly shifts with bus, route, driver, and conductor assignments.
- **Smart Recommendations**: Auto-recommends eligible, available crew based on duty hours and active leaves.
- **Leave Requests & Vacancy Fill**: Inspect affected routes for leave applicants, approve/reject leaves, and assign replacement drivers.
- **Attendance & Duty Logs**: Monitor check-in times, absences, and duty compliance across all depots.
- **Incident Management**: Review maintenance alerts and mechanical problem tickets submitted by crew members.

### 2. Bus Driver
- **Assigned Corridor Showcase**: View active departure windows, assigned bus registration, and co-conductor details.
- **One-Touch Check-in**: Log verified attendance directly from the driver portal.
- **Leave Management**: Submit categorized leave requests (Casual, Sick, Emergency) with real-time status tracking (*Pending*, *Approved*, *Rejected*).
- **Shift Trade Requests**: Exchange assigned shifts with available peer drivers.
- **Bus Problem Reporting**: Dispatch maintenance tickets for engine, brake, electrical, or AC issues.

### 3. Conductor
- **Daily Trip Verification**: View scheduled route sequences, bus numbers, and assigned drivers.
- **Trip Attendance**: One-click check-in logging for conductor rosters.
- **Leave Application**: Submit leave requests with instant manager notifications.
- **Peer Shift Swap**: Submit shift swap requests with other conductors.
- **Duty Issues**: Report ticketing terminal or passenger convenience issues.

---

## 🔄 Core Workflows

### Leave Application & Manager Approval
```
Driver/Conductor Submits Leave Request (POST /api/leaves)
               ↓
Backend Validates Date Range & Checks Overlapping Records
               ↓
Manager Reviews Pending Leaves with Shift Impact Count (GET /api/leaves/pending)
               ↓
Manager Approves/Rejects with Optional Remarks (PUT /api/leaves/:id/approve)
               ↓
Status Synchronized in Real-Time on Driver/Conductor Dashboard
```

### Smart Shift & Crew Assignment
```
Manager Configures Route, Bus & Date
               ↓
Smart Recommendation Service Scans Driver Pool
               ↓
Filters Out: Busy Shifts, Approved Leaves, Inactive Status
               ↓
Optimal Crew Selected & Shift Created (POST /api/shifts)
```

---

## 🛠 Technology Stack

### Frontend (`client/`)
- **React 18** — Single Page Application UI
- **Vite** — Lightning-fast development server & bundler
- **Tailwind CSS** — Utility-first styling with modern dark/light contrast
- **Lucide React** — Crisp icon system
- **Axios** — HTTP client with Bearer token interceptors
- **React Router v6** — Role-protected client routing

### Backend (`server/`)
- **Node.js & Express.js** — RESTful API web server
- **MongoDB & Mongoose** — Document database with schema validations and relationships
- **JSON Web Tokens (JWT)** — Stateless authentication and authorization
- **Bcrypt.js** — Secure password hashing

---

## 📁 Project Architecture

```
shift-management/
├── client/                     # React Frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI & Modal components
│   │   ├── context/            # AuthContext (session, login, role routing)
│   │   ├── pages/              # Dashboards (Manager, Driver, Conductor, Login, Signup)
│   │   ├── services/           # Axios client & centralized API helpers
│   │   ├── App.jsx             # Main Router & Route Guards
│   │   └── main.jsx            # React root entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Express.js Backend
│   ├── config/                 # Database connection setup
│   ├── controllers/            # Business logic (shifts, leaves, auth, buses, drivers)
│   ├── middleware/             # JWT auth & role authorization middlewares
│   ├── models/                 # Mongoose models (User, Driver, Conductor, Bus, Shift, LeaveRequest, etc.)
│   ├── routes/                 # Express API routes
│   ├── services/               # Smart assignment recommendation algorithms
│   ├── package.json
│   └── server.js               # Main application entry point
│
├── .env.example                # Template for environment variables
├── .gitignore                  # Git exclusion rules
├── package.json                # Root package scripts
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

### Environment Variables
Create a `.env` file inside the `server/` directory based on `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart_bus_management
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
NODE_ENV=development
```

### Backend Setup
```bash
# Navigate to backend directory
cd server

# Install dependencies
npm install

# Start development server
npm run dev
# Server will run on http://localhost:5000
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd ../client

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend will run on http://localhost:5173
```

### Running Concurrently
From the root directory:
```bash
# Install root dependencies
npm install

# Start both client and server concurrently
npm run dev
```

---

## 🔌 API Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register new Driver, Conductor, or Manager |
| `POST` | `/api/auth/login` | Public | Authenticate user & retrieve JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated profile |
| `GET` | `/api/shifts` | Private | Get assigned shifts (role-filtered) |
| `POST` | `/api/shifts` | Manager | Create shift with conflict detection |
| `GET` | `/api/leaves/my` | Private | Retrieve current user's leave requests |
| `POST` | `/api/leaves` | Private | Submit leave application |
| `GET` | `/api/leaves/pending` | Manager | Retrieve all pending leave applications |
| `PUT` | `/api/leaves/:id/approve` | Manager | Approve leave & calculate vacancies |
| `PUT` | `/api/leaves/:id/reject` | Manager | Reject leave request |
| `POST` | `/api/attendance` | Private | Mark one-touch shift attendance |
| `POST` | `/api/swaps` | Private | Submit peer shift exchange request |
| `POST` | `/api/issues` | Private | Submit vehicle defect / maintenance report |

---

## 🔒 Security & Best Practices
- Passwords hashed using standard salt rounds via `bcryptjs`.
- HTTP Bearer authorization tokens verified on every protected API endpoint.
- Role-based authorization prevents cross-role resource manipulation.
- Environment variables and credentials are fully isolated and excluded from version control.

---

## 📄 License
This project is licensed under the MIT License.
