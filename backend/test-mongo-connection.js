/**
 * Simple script to test MongoDB connection using mongoose.
 * Usage:
 *   - ensure backend/.env contains MONGODB_URI, or set env var MONGODB_URI
 *   - run: node test-mongo-connection.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set. Please create a backend/.env or set the MONGODB_URI env var.');
  process.exit(1);
}

(async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    // Print server info
    const admin = new mongoose.mongo.Admin(conn.connection.db);
    const info = await admin.serverStatus();
    console.log('MongoDB serverStatus ok. Version:', info.version);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message || err);
    process.exit(1);
  }
})();
