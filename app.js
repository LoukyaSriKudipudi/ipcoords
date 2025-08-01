const express = require("express");
const rateLimit = require("express-rate-limit");
const path = require("path");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const app = express();

const saveRealLocation = require("./controllers/saveRealLocation");
const saveIpInfo = require("./controllers/saveIpInfo");

const IPINFO_TOKEN = process.env.MAP_API_KEY;

// Middleware
app.use(express.json());

// Trust proxy for correct IP detection (important on Render)
app.set("trust proxy", 1);

// Rate limit middleware
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
  })
);

// Serve static files
app.use(express.static("public"));

// MongoDB connection
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log("✅ DB connection successful"))
  .catch((err) => console.error("❌ DB connection failed:", err));

// ping
app.get("/ping", (req, res)=>{
  res.send('pong')})
// Helper to get cleaned client IP
function getClientIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  let ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.socket.remoteAddress;

  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
  if (ip === "::1") ip = "127.0.0.1";

  return ip;
}

// Middleware to log IP
function logIP(req, res, next) {
  const userIP = getClientIP(req);
  console.log(`req.ip = ${req.ip}, userIP = ${userIP}`);
  next();
}

// API Route to get IP info and save to DB
app.get("/api", async (req, res) => {
  const clientIP = getClientIP(req);
  // const clientIP = "8.8.8.8"; // Google's DNS

  try {
    const response = await fetch(
      `https://ipinfo.io/${clientIP}?token=${IPINFO_TOKEN}`
    );
    const data = await response.json();

    if (data.error) {
      console.error("❌ IPINFO error:", data.error.message);
      return res.status(403).json({
        status: "fail",
        message: data.error.message,
      });
    }

    if (data.bogon) {
      console.warn("⚠️ Bogon IP — skipping DB save:", data.ip);
      return res.status(200).json({
        status: "ignored",
        message: "Bogon IP — no geolocation available",
        ipInfo: data,
      });
    }

    await saveIpInfo(data); // Save only valid data
    res.status(200).json({
      status: "success",
      ipInfo: data,
    });
  } catch (err) {
    console.error("❌ Fetch failed:", err.message);
    res.status(500).json({
      status: "fail",
      message: "Could not fetch IP data",
    });
  }
});

// Route for client-side geolocation
app.post("/realLocation", saveRealLocation);

// Serve index.html on root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
