const express = require('express');
const router = express.Router();
const Interview = require('../modles/InterviewSchema');
const Event = require('../modles/EventSchema ');
const Report = require('../modles/ReportSchema ');

// Simple debug endpoint to check DB connectivity and sample data
router.get('/debug', async (req, res) => {
  try {
    // Connection info (masked)
    const mongoose = require('mongoose');
    const connHost = mongoose.connection.client && mongoose.connection.client.s && mongoose.connection.client.s.url
      ? String(mongoose.connection.client.s.url)
      : (mongoose.connection.host || 'unknown');
    const maskedHost = String(connHost).replace(/(mongodb\+srv:\/\/)[^@]+@/, '$1****@');
    const interviewCount = await Interview.countDocuments();
    const eventCount = await Event.countDocuments();
    const reportCount = await Report.countDocuments();

    const latestInterviews = await Interview.find().sort({ createdAt: -1 }).limit(3).lean();
    const latestEvents = await Event.find().sort({ timestamp: -1 }).limit(5).lean();
    const latestReports = await Report.find().sort({ createdAt: -1 }).limit(3).lean();

    return res.json({
      ok: true,
      connection: { host: maskedHost, readyState: mongoose.connection.readyState },
      counts: { interviewCount, eventCount, reportCount },
      latest: { latestInterviews, latestEvents, latestReports }
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

// Preview or delete an interview and its related events/reports
// Use ?confirm=true or header 'X-Confirm-Delete: true' to perform deletion
router.delete('/interview/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const confirmQuery = req.query.confirm === 'true';
    const confirmHeader = req.get('X-Confirm-Delete') === 'true';

    const interview = await Interview.findById(id).lean();
    if (!interview) return res.status(404).json({ ok: false, error: 'Interview not found' });

    const events = await Event.find({ interviewId: id }).lean();
    const reports = await Report.find({ interviewId: id.toString() }).lean();

    if (!confirmQuery && !confirmHeader) {
      return res.json({ ok: true, preview: true, interview, counts: { events: events.length, reports: reports.length } });
    }

    // Perform deletion
    await Event.deleteMany({ interviewId: id });
    await Report.deleteMany({ interviewId: id.toString() });
    await Interview.findByIdAndDelete(id);

    return res.json({ ok: true, deleted: true, id, deletedCounts: { events: events.length, reports: reports.length } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

module.exports = router;

