const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

// Import all models
const User = require('../models/User');
const Bus = require('../models/Bus');
const Driver = require('../models/Driver');
const Conductor = require('../models/Conductor');
const Route = require('../models/Route');
const Shift = require('../models/Shift');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Maintenance = require('../models/Maintenance');
const Notification = require('../models/Notification');

dotenv.config({ path: path.join(__dirname, '../.env') });

const createCleanUser = async ({ email, employeeId, name, password, role, phone, licenseNumber }) => {
  await User.deleteOne({ email });
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    email: email.toLowerCase().trim(),
    employeeId: employeeId.toUpperCase().trim(),
    password: hashedPassword,
    role,
    phone: phone || '',
    licenseNumber: licenseNumber || ''
  });

  // Save directly with hashed password (skip pre-save double hashing by not modifying password afterwards)
  await User.collection.insertOne({
    name: user.name,
    email: user.email,
    employeeId: user.employeeId,
    password: hashedPassword,
    role: user.role,
    phone: user.phone,
    licenseNumber: user.licenseNumber,
    status: 'available',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return await User.findOne({ email: email.toLowerCase().trim() });
};

const seedDemoData = async () => {
  try {
    await connectDB();
    console.log('--- Seeding Production-Quality Demo Data for B.Tech Final Year Project ---');

    // 1. Seed Clean Accounts (Strict 3 Roles: Manager, Driver, Conductor)
    await User.deleteMany({ email: { $in: ['admin@shift.com'] } });

    const managerUser = await createCleanUser({
      name: 'Vikram Mehta (Transport Manager)',
      email: 'manager@shift.com',
      employeeId: 'MGR001',
      password: 'Manager@123',
      role: 'manager',
      phone: '+91 98765 00002'
    });

    const driverUser1 = await createCleanUser({
      name: 'Rahul Kumar (Driver)',
      email: 'driver@shift.com',
      employeeId: 'DRV101',
      password: 'Driver@123',
      role: 'driver',
      phone: '+91 98765 00101',
      licenseNumber: 'DL-KA-2022-9876'
    });

    const driverUser2 = await createCleanUser({
      name: 'Vikram Singh (Driver)',
      email: 'vikram@shift.com',
      employeeId: 'DRV102',
      password: 'Driver@123',
      role: 'driver',
      phone: '+91 98765 00102',
      licenseNumber: 'DL-KA-2021-5432'
    });

    const conductorUser1 = await createCleanUser({
      name: 'Suresh Raina (Conductor)',
      email: 'conductor@shift.com',
      employeeId: 'CND101',
      password: 'Conductor@123',
      role: 'conductor',
      phone: '+91 98765 00201'
    });

    const conductorUser2 = await createCleanUser({
      name: 'Amit Sharma (Conductor)',
      email: 'amit@shift.com',
      employeeId: 'CND102',
      password: 'Conductor@123',
      role: 'conductor',
      phone: '+91 98765 00202'
    });

    // 2. Seed Buses
    const bus1 = await Bus.findOneAndUpdate(
      { busNumber: 'BUS-101' },
      {
        busNumber: 'BUS-101',
        registrationNumber: 'KA-01-EQ-1001',
        busType: 'AC Express',
        capacity: 45,
        status: 'available',
        purchaseYear: 2023,
        notes: 'Equipped with GPS & Climate Control'
      },
      { upsert: true, new: true }
    );

    const bus2 = await Bus.findOneAndUpdate(
      { busNumber: 'BUS-102' },
      {
        busNumber: 'BUS-102',
        registrationNumber: 'KA-01-EQ-1002',
        busType: 'Standard',
        capacity: 52,
        status: 'available',
        purchaseYear: 2022
      },
      { upsert: true, new: true }
    );

    const busMaint = await Bus.findOneAndUpdate(
      { busNumber: 'BUS-103' },
      {
        busNumber: 'BUS-103',
        registrationNumber: 'KA-01-EQ-1003',
        busType: 'Electric',
        capacity: 40,
        status: 'maintenance',
        purchaseYear: 2024,
        notes: 'Brake pad inspection under maintenance'
      },
      { upsert: true, new: true }
    );

    // 3. Seed Drivers & Conductors
    const drv1 = await Driver.findOneAndUpdate(
      { employeeId: 'DRV101' },
      {
        name: 'Rahul Kumar',
        employeeId: 'DRV101',
        email: 'driver@shift.com',
        phone: '+91 98765 00101',
        licenseNumber: 'DL-KA-2022-9876',
        status: 'available',
        user: driverUser1._id
      },
      { upsert: true, new: true }
    );

    const drv2 = await Driver.findOneAndUpdate(
      { employeeId: 'DRV102' },
      {
        name: 'Vikram Singh',
        employeeId: 'DRV102',
        email: 'vikram@shift.com',
        phone: '+91 98765 00102',
        licenseNumber: 'DL-KA-2021-5432',
        status: 'available',
        user: driverUser2._id
      },
      { upsert: true, new: true }
    );

    const cnd1 = await Conductor.findOneAndUpdate(
      { employeeId: 'CND101' },
      {
        name: 'Suresh Raina',
        employeeId: 'CND101',
        email: 'conductor@shift.com',
        phone: '+91 98765 00201',
        status: 'available',
        user: conductorUser1._id
      },
      { upsert: true, new: true }
    );

    const cnd2 = await Conductor.findOneAndUpdate(
      { employeeId: 'CND102' },
      {
        name: 'Amit Sharma',
        employeeId: 'CND102',
        email: 'amit@shift.com',
        phone: '+91 98765 00202',
        status: 'available',
        user: conductorUser2._id
      },
      { upsert: true, new: true }
    );

    // 4. Seed Routes
    const route1 = await Route.findOneAndUpdate(
      { routeNumber: 'R-101' },
      {
        routeNumber: 'R-101',
        source: 'Central College Campus',
        destination: 'Tech City Terminal',
        distanceKm: 18.5,
        estimatedDurationMins: 40,
        stops: ['Campus Gate 1', 'Metro Station', 'City Center', 'Tech City']
      },
      { upsert: true, new: true }
    );

    const route2 = await Route.findOneAndUpdate(
      { routeNumber: 'R-102' },
      {
        routeNumber: 'R-102',
        source: 'North Suburb Station',
        destination: 'Industrial Zone',
        distanceKm: 28.0,
        estimatedDurationMins: 55,
        stops: ['Suburb North', 'East Highway', 'Industrial Complex']
      },
      { upsert: true, new: true }
    );

    // 5. Seed Shifts
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    await Shift.deleteMany({});

    await Shift.create([
      {
        shiftName: 'Morning Express Shift',
        shiftType: 'morning',
        bus: bus1._id,
        driver: drv1._id,
        conductor: cnd1._id,
        route: route1._id,
        startTime: '07:30 AM',
        endTime: '03:30 PM',
        shiftDate: today,
        status: 'scheduled',
        assignedBy: managerUser._id
      },
      {
        shiftName: 'Tomorrow Afternoon Route',
        shiftType: 'afternoon',
        bus: bus2._id,
        driver: drv1._id,
        conductor: cnd1._id,
        route: route2._id,
        startTime: '01:00 PM',
        endTime: '09:00 PM',
        shiftDate: tomorrow,
        status: 'scheduled',
        assignedBy: managerUser._id
      }
    ]);

    // 6. Seed Sample Leaves
    await LeaveRequest.deleteMany({});

    const nextWeekStart = new Date();
    nextWeekStart.setDate(today.getDate() + 3);
    const nextWeekEnd = new Date();
    nextWeekEnd.setDate(today.getDate() + 5);

    await LeaveRequest.create([
      {
        applicant: driverUser1._id,
        employeeId: 'DRV101',
        employeeName: 'Rahul Kumar (Driver)',
        employeeRole: 'driver',
        driver: drv1._id,
        leaveType: 'Sick Leave',
        fromDate: nextWeekStart,
        toDate: nextWeekEnd,
        startDate: nextWeekStart,
        endDate: nextWeekEnd,
        numberOfDays: 3,
        reason: 'Viral fever and prescribed medical rest by doctor.',
        remarks: 'Doctor certificate will be provided upon resumption.',
        status: 'pending',
        affectedShiftsCount: 0,
        appliedAt: new Date()
      },
      {
        applicant: conductorUser1._id,
        employeeId: 'CND101',
        employeeName: 'Suresh Raina (Conductor)',
        employeeRole: 'conductor',
        conductor: cnd1._id,
        leaveType: 'Casual Leave',
        fromDate: nextWeekStart,
        toDate: nextWeekStart,
        startDate: nextWeekStart,
        endDate: nextWeekStart,
        numberOfDays: 1,
        reason: 'Attending family wedding ceremony out of station.',
        remarks: 'Available on phone if needed.',
        status: 'pending',
        affectedShiftsCount: 0,
        appliedAt: new Date()
      }
    ]);

    // 7. Seed Maintenance Record
    await Maintenance.deleteMany({});
    await Maintenance.create({
      bus: busMaint._id,
      maintenanceType: 'repair',
      description: 'Scheduled brake overhaul and battery diagnostic',
      cost: 450,
      serviceProvider: 'Metro Transport Depot',
      status: 'in_progress'
    });

    console.log('✓ Demo accounts & transport fleet seeded successfully!');
    console.log('Manager Login:   manager@shift.com   / Manager@123');
    console.log('Driver Login:    driver@shift.com    / Driver@123');
    console.log('Conductor Login: conductor@shift.com / Conductor@123');

    process.exit(0);
  } catch (error) {
    console.error('Seed Demo Data Error:', error);
    process.exit(1);
  }
};

seedDemoData();
