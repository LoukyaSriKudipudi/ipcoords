const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "realLocation.json");

function saveRealLocationToJson(req, res) {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        status: "fail",
        message: "Latitude or longitude missing",
      });
    }

    let realLocationLog = [];

    // Step 1: Read existing data (if any)
    if (fs.existsSync(filePath)) {
      try {
        const existingData = fs.readFileSync(filePath, "utf-8");
        realLocationLog = JSON.parse(existingData);
      } catch (err) {
        console.warn("⚠️ Error parsing existing JSON. Starting fresh.");
        realLocationLog = [];
      }
    }

    // Step 2: Generate new ID
    let id = 0;
    if (realLocationLog.length > 0) {
      const lastEntry = realLocationLog[realLocationLog.length - 1];
      id = (lastEntry.id || 0) + 1;
    }

    const timestamp = new Date().toISOString();

    // Step 3: Push new data
    realLocationLog.push({ id, latitude, longitude, timestamp });

    // Step 4: Save to file
    fs.writeFile(filePath, JSON.stringify(realLocationLog, null, 2), (err) => {
      if (err) {
        console.error("❌ Error saving data:", err);
        return res.status(500).json({
          status: "error",
          message: "Failed to save location",
        });
      } else {
        console.log("✅ Data saved successfully.");
        return res.status(201).json({
          status: "success",
          message: `Coordinates received: ${latitude}, ${longitude}`,
        });
      }
    });
  } catch (err) {
    console.error("🔥 Unexpected error:", err);
    return res.status(500).json({
      status: "fail",
      message: "Unexpected server error",
    });
  }
}

module.exports = saveRealLocationToJson;
