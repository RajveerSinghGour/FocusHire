/**
 * List counts and sample documents from Interview, Event and Report collections.
 * Usage:
 *   - ensure backend/.env has MONGODB_URI
 *   - run: node list-data.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Interview = require('./src/modles/InterviewSchema');
const Event = require('./src/modles/EventSchema ');
const Report = require('./src/modles/ReportSchema ');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in backend/.env');
    process.exit(1);
  }

  try {
    console.log('Connecting to', uri.split('@')[1] || uri);
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected. Querying collections...');

    const interviewCount = await Interview.countDocuments();
    const eventCount = await Event.countDocuments();
    const reportCount = await Report.countDocuments();

    console.log(`Interviews: ${interviewCount}, Events: ${eventCount}, Reports: ${reportCount}`);

    const sampleInterview = await Interview.findOne().lean().limit(1);
    const sampleEvent = await Event.findOne().lean().limit(1);
    const sampleReport = await Report.findOne().lean().limit(1);

    console.log('Sample Interview:', sampleInterview || 'no documents');
    console.log('Sample Event:', sampleEvent || 'no documents');
    console.log('Sample Report:', sampleReport || 'no documents');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error querying DB:', err);
    process.exit(1);
  }
}

run();
