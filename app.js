const express = require("express");
const rateLimit = require("express-rate-limit");
const path = require("path");
const dotenv = require("dotenv").config();
const fetch = require("node-fetch"); // If using Node 18+, replace with global fetch
const saveIPDataToJSON = require("./saveIPDataToJSON");
const saveRealLocationToJson = require("./saveRealLocationToJson");

const app = express();
const IPINFO_TOKEN = process.env.MAP_API_KEY;

// Trust the first proxy (needed for req.ip and x-forwarded-for to work properly)
app.set("trust proxy", true);

// Parse incoming JSON
app.use(express.json());

// Rate limit to prevent abuse
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
});
app.use(limiter);

// Serve static files from public folder
app.use(express.static("public"));

// Function to get real IP from headers
function getClientIP(req) {
  // x-forwarded-for can be a list: "client, proxy1, proxy2"
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ips = forwarded.split(",");
    return ips[0].trim();
  }
  return req.connection.remoteAddress || req.socket.remoteAddress;
}

// Log IP middleware
function logIP(req, res, next) {
  const clientIP = getClientIP(req);
  console.log(`Client IP: ${clientIP}`);
  next();
}

// API endpoint to get IP location info
app.get("/api", logIP, async (req, res) => {
  const clientIP = getClientIP(req);

  try {
    const response = await fetch(
      `https://ipinfo.io/${clientIP}?token=${IPINFO_TOKEN}`
    );
    const data = await response.json();

    saveIPDataToJSON(data);

    res.status(200).json({
      status: "success",
      ipInfo: data,
    });
  } catch (err) {
    console.error("Error fetching IP info:", err.message);
    res.status(500).json({
      status: "fail",
      message: "Could not fetch IP info",
    });
  }
});

// POST route to store real location (from client-side lat/lon)
app.post("/realLocation", saveRealLocationToJson);

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
