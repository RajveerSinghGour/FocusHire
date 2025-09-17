const express = require("express");
const app = express();
const cors = require("cors");
const ConnectDb = require("./utils/Connectdb");
const InterviewRouter = require("./routes/Interview.route");
const EventRouter = require("./routes/Event.route");
const Reportrouter = require("./routes/reports.route");
const AdminRouter = require("./routes/admin.route");
const dotenv = require("dotenv");
dotenv.config();

// ✅ CORS configuration
app.use(cors({
  origin: [
    "https://focus-hire.vercel.app", // deployed frontend
    "http://localhost:5173"          // local frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Connect to MongoDB
ConnectDb();

// Routes
app.get("/", (req, res) => res.send("Hi dude"));

app.use("/api", InterviewRouter);
app.use("/events", EventRouter);
app.use("/reports", Reportrouter);
app.use("/admin", AdminRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
