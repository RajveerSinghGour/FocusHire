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

app.use(cors());
app.use(express.json());
ConnectDb();

app.get("/", (req, res) => res.send("Hi dude"));

app.use("/api", InterviewRouter);
app.use("/events",EventRouter);
app.use("/reports",Reportrouter);
app.use("/admin", AdminRouter);

app.listen(3000, () => console.log("Server running on port 3000"));
