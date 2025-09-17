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

// ✅ CORS config
const corsOptions = {
  origin: "https://focus-hire.vercel.app", // frontend domain
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Connect DB
ConnectDb();

app.get("/", (req, res) => res.send("Hi dude"));

// ✅ Routes
app.use("/api", InterviewRouter);
app.use("/events", EventRouter);
app.use("/reports", Reportrouter);
app.use("/admin", AdminRouter);

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
