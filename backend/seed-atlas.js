/**
 * Simple seeding script to add a sample Interview, some Events and a Report
 * into the connected MongoDB. Useful for verifying data in Atlas UI.
 *
 * Usage:
 *   - Ensure backend/.env has MONGODB_URI or set env var
 *   - Run: node seed-atlas.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Interview = require('./src/modles/InterviewSchema');
const Event = require('./src/modles/EventSchema ');
const Report = require('./src/modles/ReportSchema ');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set. Please add it to backend/.env');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for seeding');

    const interview = await Interview.create({
      candidateName: 'Seed Candidate',
      candidateEmail: 'seed@example.com',
      startTime: new Date(),
      endTime: new Date(Date.now() + 1000 * 60 * 5),
      videoUrl: 'https://example.com/video.webm'
    });
    console.log('Created interview:', interview._id);

    const ev1 = await Event.create({
      interviewId: interview._id,
      eventType: 'looking_away',
      timestamp: new Date(),
      duration: 5,
      details: { note: 'looked away to the left' }
    });
    const ev2 = await Event.create({
      interviewId: interview._id,
      eventType: 'no_face',
      timestamp: new Date(),
      duration: 3,
      details: { note: 'no face detected briefly' }
    });

    // Associate events with interview
    interview.events.push(ev1._id, ev2._id);
    await interview.save();

    const report = await Report.create({
      interviewId: interview._id.toString(),
      candidateName: interview.candidateName,
      candidateEmail: interview.candidateEmail,
      duration: 300,
      totalEvents: 2,
      suspiciousCounts: {
        focusLost: 1,
        noFace: 1,
        multipleFaces: 0,
        phoneDetected: 0,
        notesDetected: 0
      },
      integrityScore: 85,
      reportFile: '',
    });

    console.log('Created report:', report._id);

    console.log('Seeding complete. Check Atlas for the created documents under interview, events and reports collections.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
})();
