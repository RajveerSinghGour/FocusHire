// Event.js
const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true },
  eventType: { type: String, required: true }, // "looking_away", "no_face", "phone_detected"
  timestamp: { type: Date, default: Date.now },
  duration: { type: Number }, // e.g., 6s away
  details: { type: Object }
});

module.exports = mongoose.model("Event", EventSchema);
