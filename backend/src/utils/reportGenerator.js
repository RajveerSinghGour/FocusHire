// utils/reportGenerator.js
const Report = require("../modles/ReportSchema ");
const Event = require("../modles/EventSchema ");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Generate a proctoring report after interview ends
 * @param {Object} interviewData - Raw interview data
 * @returns {Promise<Object>} Saved Report document
 */
async function generateReport(interviewData) {
  const {
    interviewId,
    candidateName,
    candidateEmail,
    duration,
    events = []
  } = interviewData;

  // Fetch events from DB for this interview to ensure we count what's stored
  let eventsFromDb = events;
  try {
    const fetched = await Event.find({ interviewId }).lean();
    if (fetched && fetched.length > 0) {
      eventsFromDb = fetched;
    }
  } catch (err) {
    console.warn("Could not fetch events for report generation:", err.message);
  }

  // Count suspicious events (only once if detected at least once)
  console.log(`Generating report for interview ${interviewId} using ${eventsFromDb.length} events`);

  const suspiciousCounts = {
    focusLost: eventsFromDb.some(e => e.eventType === "looking_away") ? 1 : 0,
    noFace: eventsFromDb.some(e => e.eventType === "no_face") ? 1 : 0,
    multipleFaces: eventsFromDb.some(e => e.eventType === "multiple_faces_detected") ? 1 : 0,
    phoneDetected: eventsFromDb.some(e => e.eventType === "cell phone_detected") ? 1 : 0,
    notesDetected: eventsFromDb.some(e =>
      ["book_detected", "notes_detected"].includes(e.eventType)
    ) ? 1 : 0
  };

  const totalEvents = Object.values(suspiciousCounts).reduce((a, b) => a + b, 0);

  // Scoring logic (deduction happens once per type, not per occurrence)
  const integrityScore = Math.max(
    0,
    100 - (suspiciousCounts.focusLost * 5 +
            suspiciousCounts.noFace * 5 +
            suspiciousCounts.multipleFaces * 10 +
            suspiciousCounts.phoneDetected * 10 +
            suspiciousCounts.notesDetected * 10)
  );

  // Create DB record
  const report = new Report({
    interviewId,
    candidateName,
    candidateEmail,
    duration,
    totalEvents,
    suspiciousCounts,
    integrityScore
  });

  const savedReport = await report.save();

  // Generate PDF
  const reportsDir = path.join(__dirname, "../reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  const pdfPath = path.join(reportsDir, `${savedReport._id}.pdf`);
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(pdfPath));

  // PDF Content
  doc.fontSize(20).text("Proctoring Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Candidate Name: ${candidateName || "N/A"}`);
  doc.text(`Candidate Email: ${candidateEmail || "N/A"}`);
  doc.text(`Interview ID: ${interviewId}`);
  doc.text(`Duration: ${duration} seconds`);
  doc.text(`Date: ${new Date(savedReport.createdAt).toLocaleString()}`);
  doc.moveDown();

  doc.fontSize(14).text("Suspicious Event Detections (1 = detected, 0 = not detected):", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Focus Lost: ${suspiciousCounts.focusLost}`);
  doc.text(`No Face: ${suspiciousCounts.noFace}`);
  doc.text(`Multiple Faces: ${suspiciousCounts.multipleFaces}`);
  doc.text(`Phone Detected: ${suspiciousCounts.phoneDetected}`);
  doc.text(`Notes/Book Detected: ${suspiciousCounts.notesDetected}`);
  doc.moveDown();

  doc.fontSize(14).text(`Integrity Score: ${integrityScore}%`, {
    underline: true
  });

  doc.moveDown();

  // Add a detailed events section so PDF shows what was captured
  doc.addPage();
  doc.fontSize(18).text('Detailed Event Log', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);

  if (eventsFromDb && eventsFromDb.length > 0) {
    eventsFromDb.forEach((ev, idx) => {
      const ts = new Date(ev.timestamp).toLocaleString();
      doc.text(`${idx + 1}. [${ts}] ${ev.eventType}`);
      if (ev.duration) doc.text(`   - Duration: ${ev.duration} seconds`);
      if (ev.details && Object.keys(ev.details).length > 0) {
        doc.text(`   - Details: ${JSON.stringify(ev.details)}`);
      }
      doc.moveDown(0.25);
    });
  } else {
    doc.text('No events recorded for this interview.');
  }

  doc.end();

  // Save PDF path in DB
  savedReport.reportFile = pdfPath;
  await savedReport.save();

  return savedReport;
}

module.exports = generateReport;
