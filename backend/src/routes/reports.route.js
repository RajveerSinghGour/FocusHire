const express = require("express");
const Report = require("../modles/ReportSchema");
const path = require("path");
const fs = require("fs");

const Reportrouter = express.Router();

// ==============================
// List all reports
// ==============================
Reportrouter.get("/", async (req, res) => {
  try {
    console.log("📥 GET /reports request received");

    let reports = await Report.find().sort({ createdAt: -1 }).lean();

    // Collect interviewIds and fetch interviews in bulk
    const interviewIds = [...new Set(reports.map((r) => r.interviewId).filter(Boolean))];
    if (interviewIds.length > 0) {
      const Interview = require("../modles/InterviewSchema");
      const interviews = await Interview.find({ _id: { $in: interviewIds } })
        .select("videoUrl")
        .lean();

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
    console.error("❌ Error listing reports:", err);
    res.status(500).json({ error: "Failed to list reports" });
  }
});

// ==============================
// Download / View report PDF
// ==============================
Reportrouter.get("/:id/pdf", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 PDF download request for report:", id);

    const report = await Report.findById(id);

    if (!report) {
      console.warn("⚠️ Report not found in DB for id:", id);
      return res.status(404).json({ error: "Report not found in database" });
    }

    if (!report.reportFile) {
      console.warn("⚠️ Report found but no reportFile field:", report);
      return res.status(404).json({ error: "No PDF attached to this report" });
    }

    // Case 1: Cloudinary or remote URL
    if (typeof report.reportFile === "string" && report.reportFile.startsWith("http")) {
      console.log("📤 Redirecting to Cloudinary/remote URL:", report.reportFile);
      return res.redirect(report.reportFile);
    }

    // Case 2: Local file storage
    const filePath = path.resolve(report.reportFile);
    console.log("🔍 Checking local file path:", filePath);

    if (!fs.existsSync(filePath)) {
      console.error("❌ PDF file not found on disk:", filePath);
      return res.status(404).json({ error: "PDF file not found on server" });
    }

    // Serve the PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="report-${id}.pdf"`);
    res.sendFile(filePath);
  } catch (err) {
    console.error("❌ Error fetching report PDF:", err);
    res.status(500).json({ error: "Failed to fetch report PDF" });
  }
});

module.exports = Reportrouter;
