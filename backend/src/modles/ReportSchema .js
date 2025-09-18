const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
  candidateName: String,
  candidateEmail: String,
  duration: Number,
  totalEvents: { type: Number, default: 0 },
  suspiciousCounts: {
    focusLost: { type: Number, default: 0 },
    noFace: { type: Number, default: 0 },
    multipleFaces: { type: Number, default: 0 },
    phoneDetected: { type: Number, default: 0 },
    notesDetected: { type: Number, default: 0 },
    audioDetected: { type: Number, default: 0 }
  },
  integrityScore: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", ReportSchema);
