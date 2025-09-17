const Report = require("../modles/ReportSchema");
const Event = require("../modles/EventSchema");
const PDFDocument = require("pdfkit");
const cloudinary = require("./cloudinary"); // cloudinary config
const { Readable } = require("stream");

async function generateReport(interviewData) {
  const { interviewId, candidateName, candidateEmail, duration, events = [] } = interviewData;

  // Fetch events from DB
  let eventsFromDb = events;
  try {
    const fetched = await Event.find({ interviewId }).lean();
    if (fetched.length > 0) eventsFromDb = fetched;
  } catch (err) {
    console.warn("Could not fetch events:", err.message);
  }

  // Suspicious counts
  const suspiciousCounts = {
    focusLost: eventsFromDb.some(e => e.eventType === "looking_away") ? 1 : 0,
    noFace: eventsFromDb.some(e => e.eventType === "no_face") ? 1 : 0,
    multipleFaces: eventsFromDb.some(e => e.eventType === "multiple_faces_detected") ? 1 : 0,
    phoneDetected: eventsFromDb.some(e => e.eventType === "cell phone_detected") ? 1 : 0,
    notesDetected: eventsFromDb.some(e => ["book_detected","notes_detected"].includes(e.eventType)) ? 1 : 0
  };

  const totalEvents = Object.values(suspiciousCounts).reduce((a,b)=>a+b,0);
  const integrityScore = Math.max(0, 100 - (
    suspiciousCounts.focusLost*5 +
    suspiciousCounts.noFace*5 +
    suspiciousCounts.multipleFaces*10 +
    suspiciousCounts.phoneDetected*10 +
    suspiciousCounts.notesDetected*10
  ));

  // Save initial report
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

  // Generate PDF in memory
  const doc = new PDFDocument();
  const buffers = [];
  doc.on("data", buffers.push.bind(buffers));

  const pdfBuffer = await new Promise(resolve => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    // PDF content
    doc.fontSize(20).text("Proctoring Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Candidate Name: ${candidateName || "N/A"}`);
    doc.text(`Candidate Email: ${candidateEmail || "N/A"}`);
    doc.text(`Interview ID: ${interviewId}`);
    doc.text(`Duration: ${duration} seconds`);
    doc.text(`Date: ${new Date(savedReport.createdAt).toLocaleString()}`);
    doc.moveDown();
    doc.fontSize(14).text("Suspicious Event Detections (1=detected, 0=not detected):", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Focus Lost: ${suspiciousCounts.focusLost}`);
    doc.text(`No Face: ${suspiciousCounts.noFace}`);
    doc.text(`Multiple Faces: ${suspiciousCounts.multipleFaces}`);
    doc.text(`Phone Detected: ${suspiciousCounts.phoneDetected}`);
    doc.text(`Notes/Book Detected: ${suspiciousCounts.notesDetected}`);
    doc.moveDown();
    doc.fontSize(14).text(`Integrity Score: ${integrityScore}%`, { underline: true });

    doc.addPage();
    doc.fontSize(18).text("Detailed Event Log", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    if (eventsFromDb.length > 0) {
      eventsFromDb.forEach((ev, idx) => {
        const ts = new Date(ev.timestamp).toLocaleString();
        doc.text(`${idx+1}. [${ts}] ${ev.eventType}`);
        if (ev.duration) doc.text(`   - Duration: ${ev.duration} seconds`);
        if (ev.details && Object.keys(ev.details).length > 0) doc.text(`   - Details: ${JSON.stringify(ev.details)}`);
        doc.moveDown(0.25);
      });
    } else {
      doc.text("No events recorded for this interview.");
    }

    doc.end();
  });

  // Upload PDF to Cloudinary
  const uploadToCloudinary = buffer =>
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "raw", public_id: `reports/${savedReport._id}` },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      Readable.from(buffer).pipe(stream);
    });

  const uploadResult = await uploadToCloudinary(pdfBuffer);

  // Save only Cloudinary URL (no localhost path)
  savedReport.reportFile = uploadResult.secure_url;
  await savedReport.save();

  return savedReport;
}

module.exports = generateReport;
