const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  interviewId: { type: String, required: true },
  candidateName: String,
  candidateEmail: String,
  duration: Number,
  totalEvents: Number,
  suspiciousCounts: {
    focusLost: Number,
    noFace: Number,
    multipleFaces: Number,
    phoneDetected: Number,
    notesDetected: Number
  },
  integrityScore: Number,
  reportFile: String, //  path to generated PDF
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", ReportSchema);
