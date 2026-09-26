const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_bus_management';

    // If separate username and password are provided, safely construct
    if (process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD) {
      if (mongoUri.includes('<username>') || mongoUri.includes('<password>')) {
        mongoUri = mongoUri
          .replace('<username>', encodeURIComponent(process.env.MONGODB_USERNAME))
          .replace('<password>', encodeURIComponent(process.env.MONGODB_PASSWORD));
      }
    }

    const dbName = process.env.DB_NAME || 'smart_bus_management';

    const conn = await mongoose.connect(mongoUri, {
      dbName,
      serverSelectionTimeoutMS: 5000
    });

    console.log(`=================================`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name:    ${conn.connection.name}`);
    console.log(`Connection State: Ready`);
    console.log(`=================================`);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB runtime connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB successfully reconnected.');
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to application termination.');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error(`=================================`);
    console.error(`CRITICAL: MongoDB Atlas connection failed.`);
    console.error(`Please verify MONGODB_URI or Atlas IP Whitelist.`);
    const sanitizedError = error.message ? error.message.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://***:***@') : error;
    console.error(`Error details: ${sanitizedError}`);
    console.error(`=================================`);
    process.exit(1);
  }
};

module.exports = connectDB;
