/**
 * Safe deletion script for interview-related data.
 * Usage:
 *   - Preview what will be deleted:
 *       node clear-interviews.js --id=<interviewId>
 *       node clear-interviews.js --all
 *   * Perform deletion (requires --yes):
 *       node clear-interviews.js --id=<interviewId> --yes
 *       node clear-interviews.js --all --yes
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Interview = require('./src/modles/InterviewSchema');
const Event = require('./src/modles/EventSchema ');
const Report = require('./src/modles/ReportSchema ');

const args = process.argv.slice(2);
const argMap = {};
args.forEach(a => {
  if (a.startsWith('--')) {
    const [k, v] = a.split('=');
    argMap[k.replace('--','')] = v === undefined ? true : v;
  }
});

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set in backend/.env');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const { id, all, yes } = argMap;

    if (!id && !all) {
      console.log('No action specified. Use --id=<interviewId> to delete one interview or --all to delete everything. Add --yes to actually perform deletion.');
      process.exit(0);
    }

    if (id) {
      const interview = await Interview.findById(id).lean();
      if (!interview) {
        console.log('Interview not found:', id);
        process.exit(1);
      }

      const events = await Event.find({ interviewId: id }).lean();
      const reports = await Report.find({ interviewId: id.toString() }).lean();

      console.log(`Interview ${id} will be deleted. Found ${events.length} events and ${reports.length} reports.`);
      if (!yes) {
        console.log('Preview mode. Re-run with --yes to perform deletion.');
        process.exit(0);
      }

      // perform deletion
      await Event.deleteMany({ interviewId: id });
      await Report.deleteMany({ interviewId: id.toString() });
      await Interview.findByIdAndDelete(id);
      console.log('Deleted interview, its events and reports.');
      process.exit(0);
    }

    if (all) {
      const interviewCount = await Interview.countDocuments();
      const eventCount = await Event.countDocuments();
      const reportCount = await Report.countDocuments();
      console.log(`About to delete ALL data: Interviews=${interviewCount}, Events=${eventCount}, Reports=${reportCount}`);
      if (!yes) {
        console.log('Preview mode. Re-run with --all --yes to delete everything.');
        process.exit(0);
      }

      await Event.deleteMany({});
      await Report.deleteMany({});
      await Interview.deleteMany({});
      console.log('All interview, event and report data deleted.');
      process.exit(0);
    }

  } catch (err) {
    console.error('Error during deletion:', err);
    process.exit(1);
  }
}

run();
