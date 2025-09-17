const express = require('express');
const Interview = require("../modles/InterviewSchema");
const Event = require("../modles/EventSchema");
const EventRouter = express.Router();


EventRouter.get("/", (req, res) => {
    res.send("got it");
})

// DEBUG: list all events (development convenience)
EventRouter.get("/all", async (req, res) => {
    try {
        const events = await Event.find().sort({ timestamp: -1 }).lean();
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save Event in real time
EventRouter.post("/", async (req, res) => {
    console.log("got the request on event");
    try {
        const { interviewId, eventType, duration, details } = req.body;
        const event = new Event({ interviewId, eventType, duration, details });
        await event.save();
       let data =  await Interview.findByIdAndUpdate(interviewId, { $push: { events: event._id } });
        console.log(data);
        res.status(201).json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = EventRouter;
