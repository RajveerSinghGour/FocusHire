const express = require("express");
const Report = require("../modles/ReportSchema");
const path = require("path");
const fs = require("fs");

const Reportrouter = express.Router();

// List all reports - include the interview's videoUrl when available
Reportrouter.get("/", async (req, res) => {
  try {
    console.log("got the req");
    // Use lean for plain objects
    let reports = await Report.find().sort({ createdAt: -1 }).lean();

    // Collect interviewIds and fetch interviews in bulk
    const interviewIds = [...new Set(reports.map((r) => r.interviewId).filter(Boolean))];
    if (interviewIds.length > 0) {
      const Interview = require("../modles/InterviewSchema");
      const interviews = await Interview.find({ _id: { $in: interviewIds } }).select("videoUrl").lean();
      const map = {};
      interviews.forEach((i) => {
        map[i._id.toString()] = i.videoUrl;
      });

      // Attach interviewVideoUrl to each report
      reports = reports.map((r) => ({
        ...r,
        interviewVideoUrl: map[r.interviewId] || null,
      }));
    } else {
      reports = reports.map((r) => ({ ...r, interviewVideoUrl: null }));
    }

    res.json(reports);
  } catch (err) {
    console.error('Error listing reports:', err);
    res.status(500).json({ error: 'Failed to list reports' });
  }
});

// Download report PDF
Reportrouter.get("/:id/pdf", async (req, res) => {
  const { id } = req.params;
  const report = await Report.findById(id);
  if (!report || !report.reportFile) {
    return res.status(404).json({ error: "Report not found" });
  }

  // If reportFile is a URL (e.g., Cloudinary), redirect the browser to it
  if (typeof report.reportFile === 'string' && report.reportFile.startsWith('http')) {
    return res.redirect(report.reportFile);
  }

  const filePath = path.resolve(report.reportFile);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'PDF file not found' });
  }

  // Serve PDF inline so browser can render it instead of forcing download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="report-${id}.pdf"`);
  res.sendFile(filePath);
});

module.exports = Reportrouter;
