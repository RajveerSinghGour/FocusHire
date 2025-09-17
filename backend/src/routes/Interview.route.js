const express = require('express');
const Interview = require("../modles/InterviewSchema"); // fixed 'modles'
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");
const InterviewRouter = express.Router();
const generateReport = require("../utils/reportGenerator");

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

InterviewRouter.get("/", (req, res) => {
  res.send("got it");
})

// POST: Start Interview
InterviewRouter.post("/start-interview", async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ message: "All input fields are required" });
    }

    // Save to DB
    const interview = new Interview({
      candidateName: name,
      candidateEmail: email,
    });

    await interview.save();

    console.log("Interview saved:", interview);

    res.status(201).json({
      message: "Data saved successfully",
      interviewId: interview._id,
    });
  } catch (error) {
    console.error("Error saving interview:", error);
    res.status(500).json({ message: "Some error occurred" });
  }
});


// End interview route (upload to Cloudinary)
InterviewRouter.post("/end-interview/:id", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Quick Cloudinary credential check
    if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET || process.env.API_KEY.startsWith('your_')) {
      console.error('Cloudinary credentials missing or placeholder values.');
      return res.status(503).json({ error: 'Cloudinary not configured. Please set CLOUD_NAME/API_KEY/API_SECRET.' });
    }

    const interviewId = req.params.id;
    const fileBuffer = req.file.buffer;

    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "video", folder: "interviews" },
      async (error, result) => {
        if (error) return res.status(500).json({ error: error.message });

        // Update Interview record with endTime & video
        const interview = await Interview.findByIdAndUpdate(
          interviewId,
          {
            endTime: new Date(),
            videoUrl: result.secure_url,
          },
          { new: true }
        ).populate("events");

        if (!interview) {
          return res.status(404).json({ error: "Interview not found" });
        }

        // Calculate duration in seconds (endTime - startTime)
        const duration =
          (new Date(interview.endTime) - new Date(interview.startTime)) / 1000;

        console.log("Interview saved:", interview);
        console.log("Duration (seconds):", duration);

        // Call report generator
        const report = await generateReport({
          interviewId: interview._id.toString(),
          candidateName: interview.candidateName,
          candidateEmail: interview.candidateEmail,
          duration, // now correct duration
          events: interview.events || []
        });

        res.json({
          success: true,
          message: "Interview ended, video uploaded, and report generated",
          videoUrl: result.secure_url,
          report,
        });
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  } catch (err) {
    console.error("Error in end-interview:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = InterviewRouter;
