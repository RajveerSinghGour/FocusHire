import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: ["https://focus-hire.vercel.app", "http://localhost:3000"], // allow frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
