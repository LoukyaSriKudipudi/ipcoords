const express = require("express");
const rateLimit = require("express-rate-limit");
const path = require("path");
const dotenv = require("dotenv").config();
const saveIPDataToJSON = require("./saveIPDataToJSON");
const saveRealLocationToJson = require("./saveRealLocationToJson");

const app = express();
const IPINFO_TOKEN = process.env.MAP_API_KEY;

app.use(express.json());

// Trust proxy for correct IP detection (important on Render)
app.set("trust proxy", 1);

// Rate limit
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
});
app.use(limiter);

// Serve static files
app.use(express.static("public"));

// Helper: Get real client IP from request
function getClientIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress;
}

// Log IP middleware
function logIP(req, res, next) {
  const userIP = getClientIP(req);
  console.log(`req.ip is ${req.ip}, userIP is ${userIP}`);
  next();
}

// API Route to get IP details
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
    console.error("Fetch error:", err.message);
    res.status(500).json({
      status: "fail",
      message: "Could not fetch IP data",
    });
  }
});

// Save real geolocation from client
app.post("/realLocation", saveRealLocationToJson);

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Log environment
if (process.env.NODE_ENV === "development") {
  console.log("🚧 Running in development mode");
} else if (process.env.NODE_ENV === "production") {
  console.log("🚀 Running in production mode");
} else {
  console.log("ℹ️ Environment:", process.env.NODE_ENV || "not set");
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
