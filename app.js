const express = require("express");
const rateLimit = require("express-rate-limit");
const path = require("path");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const app = express();

const saveRealLocation = require("./controllers/saveRealLocation");
const saveIpInfo = require("./controllers/saveIpInfo");
const saveGeoLocation = require("./controllers/saveGeoLocation");

const IPINFO_TOKEN = process.env.MAP_API_KEY;

// Middleware
app.use(express.json());
app.set("trust proxy", 1);

// Rate limiter
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 20,
  })
);

// Serve frontend static files
app.use(express.static("public"));

// MongoDB Connection
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log("✅ DB connection successful"))
  .catch((err) => console.error("❌ DB connection failed:", err));

// Utils
function getClientIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  let ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.socket.remoteAddress;
  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
  if (ip === "::1") ip = "127.0.0.1";
  return ip;
}

function logIndianTime() {
  const ist = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  console.log("🕒 IST:", ist);
}

function logIP(req, res, next) {
  const userIP = getClientIP(req);
  console.log(`req.ip = ${req.ip}, userIP = ${userIP}`);
  next();
}

// Route: IP-based geolocation info
app.get("/api", logIP, async (req, res) => {
  const clientIP = "104.18.12.123"; // Use getClientIP(req) in production

  try {
    const response = await fetch(
      `https://ipinfo.io/${clientIP}?token=${IPINFO_TOKEN}`
    );
    const data = await response.json();

    if (data.error) {
      console.error("❌ IPINFO error:", data.error.message);
      return res
        .status(403)
        .json({ status: "fail", message: data.error.message });
    }

    if (data.bogon) {
      console.warn("⚠️ Bogon IP — skipping DB save:", data.ip);
      return res.status(200).json({
        status: "ignored",
        message: "Bogon IP — no geolocation available",
        ipInfo: data,
      });
    }

    await saveIpInfo(data);
    res.status(200).json({ status: "success", ipInfo: data });
  } catch (err) {
    console.error("❌ Fetch failed:", err.message);
    res
      .status(500)
      .json({ status: "fail", message: "Could not fetch IP data" });
  }
});

// Route: Save real-time geolocation from browser
app.post("/realLocation", saveRealLocation);

// Route: Get address using Nominatim reverse geocoding
app.get("/coordstoloc", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res
      .status(400)
      .json({ status: "fail", message: "Missing coordinates" });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    const response = await fetch(url);

    const data = await response.json();

    // ✅ Log with Indian time
    logIndianTime();

    // ✅ Save to DB using controller
    await saveGeoLocation(data);

    if (data.display_name) {
      res.json({ status: "success", location: data.display_name });
    } else {
      res.json({ status: "fail", message: "No address found" });
    }
  } catch (err) {
    console.error("❌ Error during reverse geocoding:", err.message);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Route: Serve frontend page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
