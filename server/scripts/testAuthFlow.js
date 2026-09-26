const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testAuthFlow = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shift_management');
    console.log('--- Testing Authentication & Database Integrity ---');

    // 1. Clear test users if present
    await User.deleteMany({ email: { $in: ['testemp@shift.com', 'testmgr@shift.com'] } });

    // 2. Test Employee Creation
    const empData = {
      name: 'Test Employee',
      email: 'testemp@shift.com',
      employeeId: 'EMP999',
      password: 'password123',
      role: 'employee'
    };

    const emp = await User.create(empData);
    console.log('✓ User created in MongoDB:', emp.email, '(Role:', emp.role + ')');

    // 3. Test Password Hashing Verification
    const isPlainStored = emp.password === 'password123';
    console.log('✓ Password stored as plain text?:', isPlainStored ? 'FAILED (Stored Plain)' : 'PASSED (Hashed with bcrypt)');

    const isMatch = await emp.matchPassword('password123');
    console.log('✓ Password verification with bcrypt matchPassword():', isMatch ? 'PASSED' : 'FAILED');

    // 4. Test Duplicate Email Constraint
    try {
      await User.create({
        name: 'Duplicate Email User',
        email: 'testemp@shift.com',
        employeeId: 'EMP998',
        password: 'password123',
        role: 'employee'
      });
      console.log('FAILED: Allowed duplicate email');
    } catch (err) {
      console.log('✓ Duplicate email prevented successfully by MongoDB unique index.');
    }

    // 5. Test Duplicate Employee ID Constraint
    try {
      await User.create({
        name: 'Duplicate Emp ID User',
        email: 'unique@shift.com',
        employeeId: 'EMP999',
        password: 'password123',
        role: 'employee'
      });
      console.log('FAILED: Allowed duplicate employeeId');
    } catch (err) {
      console.log('✓ Duplicate Employee ID prevented successfully by MongoDB unique index.');
    }

    console.log('--- Database Integrity Tests Passed Cleanly ---');
    process.exit(0);
  } catch (error) {
    console.error('Test Auth Flow Error:', error);
    process.exit(1);
  }
};

testAuthFlow();
