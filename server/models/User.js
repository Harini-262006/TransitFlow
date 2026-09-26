const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address'
      ]
    },
    employeeId: {
      type: String,
      required: [true, 'Please provide an Employee ID'],
      unique: true,
      trim: true,
      uppercase: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
      type: String,
      enum: ['manager', 'driver', 'conductor', 'MANAGER', 'DRIVER', 'CONDUCTOR'],
      default: 'driver',
      set: v => v ? v.toLowerCase() : v
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    licenseNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['available', 'on_duty', 'on_leave', 'inactive'],
      default: 'available'
    },
    joiningDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare user password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sanitize user object to hide password
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
