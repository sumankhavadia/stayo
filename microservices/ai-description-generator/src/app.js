import express from "express";
import dotenv from "dotenv";


dotenv.config();

const app = express();

// Middleware
app.use(express.json());



// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "AI Description Service is running ✅" });
});

export default app;
