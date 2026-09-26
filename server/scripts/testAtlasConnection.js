const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../config/db');

// Import all models
const User = require('../models/User');
const Bus = require('../models/Bus');
const Driver = require('../models/Driver');
const Conductor = require('../models/Conductor');
const Route = require('../models/Route');
const Shift = require('../models/Shift');
const Notification = require('../models/Notification');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testAtlasConnection = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('\n--- Verifying MongoDB Models & Data Persistence ---');

    // 1. Clean previous test items
    await User.deleteMany({ email: 'atlas_test_mgr@bus.com' });
    await Bus.deleteMany({ busNumber: 'BUS-ATLAS-101' });
    await Driver.deleteMany({ licenseNumber: 'DL-ATLAS-8888' });
    await Conductor.deleteMany({ employeeId: 'COND-ATLAS-777' });
    await Route.deleteMany({ routeNumber: 'ROUTE-ATLAS-10' });

    // 2. Create User
    const user = await User.create({
      name: 'Atlas Test Manager',
      email: 'atlas_test_mgr@bus.com',
      employeeId: 'EMP-ATLAS-001',
      password: 'password123',
      role: 'admin'
    });
    console.log('✓ User model persisted to MongoDB:', user.name, `(${user.email})`);

    // 3. Create Bus
    const bus = await Bus.create({
      busNumber: 'BUS-ATLAS-101',
      registrationNumber: 'KA-01-EQ-9999',
      capacity: 45,
      modelName: 'Volvo B11R',
      status: 'available'
    });
    console.log('✓ Bus model persisted to MongoDB:', bus.busNumber, `(Reg: ${bus.registrationNumber})`);

    // 4. Create Driver
    const driver = await Driver.create({
      name: 'Atlas Driver Dave',
      employeeId: 'DRV-ATLAS-999',
      licenseNumber: 'DL-ATLAS-8888',
      phone: '+1 555 0192',
      status: 'available',
      user: user._id
    });
    console.log('✓ Driver model persisted to MongoDB:', driver.name, `(License: ${driver.licenseNumber})`);

    // 5. Create Conductor
    const conductor = await Conductor.create({
      name: 'Atlas Conductor Chris',
      employeeId: 'COND-ATLAS-777',
      phone: '+1 555 0193',
      status: 'available',
      user: user._id
    });
    console.log('✓ Conductor model persisted to MongoDB:', conductor.name, `(ID: ${conductor.employeeId})`);

    // 6. Create Route
    const route = await Route.create({
      routeNumber: 'ROUTE-ATLAS-10',
      source: 'Central Bus Terminal',
      destination: 'Tech Park Station',
      distanceKm: 24.5,
      estimatedDurationMins: 45,
      stops: ['Terminal', 'City Center', 'University', 'Tech Park']
    });
    console.log('✓ Route model persisted to MongoDB:', route.routeNumber, `(${route.source} -> ${route.destination})`);

    // 7. Create Shift
    const shift = await Shift.create({
      bus: bus._id,
      driver: driver._id,
      conductor: conductor._id,
      route: route._id,
      startTime: '08:00 AM',
      endTime: '04:00 PM',
      shiftDate: new Date(),
      status: 'scheduled',
      assignedBy: user._id
    });
    console.log('✓ Shift model persisted to MongoDB! ID:', shift._id);

    // 8. Create Notification
    const notification = await Notification.create({
      recipient: user._id,
      title: 'Shift Assignment Notice',
      message: `Shift #${shift._id} assigned for route ${route.routeNumber}`
    });
    console.log('✓ Notification model persisted to MongoDB! ID:', notification._id);

    console.log('\n=================================================');
    console.log('ALL MONGO DB MODELS SUCCESSFULLY TESTED & PERSISTED!');
    console.log('=================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Test Atlas Connection Error:', error);
    process.exit(1);
  }
};

testAtlasConnection();
