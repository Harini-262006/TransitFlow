const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const busRoutes = require('./routes/busRoutes');
const driverRoutes = require('./routes/driverRoutes');
const conductorRoutes = require('./routes/conductorRoutes');
const routeRoutes = require('./routes/routeRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const swapRoutes = require('./routes/swapRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const issueRoutes = require('./routes/issueRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const dutyRoutes = require('./routes/dutyRoutes');
const replacementRoutes = require('./routes/replacementRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
// Connect to MongoDB
connectDB();

const app = express();

// Allowed Origins for Development & Production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.CLIENT_URL
].filter(Boolean);

// Enable CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or allowed frontend origins
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    // Permissive fallback for localhost ports
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[API Request] ${req.method} ${req.originalUrl}`);
  next();
});

// API Endpoints Mounting
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/conductors', conductorRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/duties', dutyRoutes);
app.use('/api/replacements', replacementRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Shift Management API Server is active',
    runningOn: `http://localhost:${PORT}`,
    database: 'Connected'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`Shift Management Server`);
  console.log(`Running on: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================`);
});
