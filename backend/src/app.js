const express = require("express");
const cors = require("cors");
const path = require("path");

const analyzeRoutes = require("./routes/analyzeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint (for Render)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "PharmaGuard", timestamp: new Date().toISOString() });
});

// MAIN API ROUTE
app.use("/api", analyzeRoutes);

// Serve frontend build
const frontendPath = path.join(__dirname, "..", "dist");
app.use(express.static(frontendPath));

// Fallback for React Router
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

module.exports = app;
