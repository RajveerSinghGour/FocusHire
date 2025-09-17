// Interview.js
const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
  candidateName: { type: String, required: true },
  candidateEmail: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  videoUrl: { type: String }, // saved video path / cloud URL
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }]
});

module.exports = mongoose.model("Interview", InterviewSchema);
