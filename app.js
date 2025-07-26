const express = require("express");
const rateLimit = require("express-rate-limit");
const path = require("path");
const dotenv = require("dotenv").config();
const saveIPDataToJSON = require("./saveIPDataToJSON");
const saveRealLocationToJson = require("./saveRealLocationToJson");
const app = express();
const IPINFO_TOKEN = process.env.MAP_API_KEY;
app.use(express.json());

// Trust proxy for correct IP detection
app.set("trust proxy", 1);

// Rate limit
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
});

app.use(limiter);

// Serve static files
app.use(express.static("public"));

// Log IP middleware
function logIP(req, res, next) {
  const userIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  console.log(`req.ip is ${req.ip}, userIP is ${userIP}`);
  next();
}

// API Route
app.get("/api", logIP, async (req, res) => {
  try {
    const response = await fetch(
      `https://ipinfo.io/json?token=${IPINFO_TOKEN}`
    );
    const data = await response.json();
    saveIPDataToJSON(data);
    res.status(200).json({
      status: "success",
      ipInfo: data,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "Could not fetch IP data",
    });
  }
});

app.post("/realLocation", saveRealLocationToJson);

// Serve index.html on root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
