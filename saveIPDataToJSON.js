const fs = require("fs");
const path = require("path");

const saveIPDataToJSONFilePath = path.join(__dirname, "saveIPDataToJSON.json");
function saveIPDataToJSON(newData) {
  let ipLog = [];

  newData.timestamp = new Date().toISOString();
  if (fs.existsSync(saveIPDataToJSONFilePath)) {
    try {
      const existingData = fs.readFileSync(saveIPDataToJSONFilePath, "utf-8");
      ipLog = JSON.parse(existingData);
      if (!Array.isArray(ipLog)) ipLog = [];
    } catch (err) {
      console.warn("⚠️ Error reading/parsing existing JSON. Starting fresh.");
      ipLog = [];
    }
  }

  let id = 0;
  if (ipLog.length > 0) {
    const lastEntry = ipLog[ipLog.length - 1];
    const newEntryId = lastEntry.id * 1 + 1;
    id = newEntryId || 0;
  }
  newData.id = id;
  ipLog.push(newData);

  fs.writeFile(
    saveIPDataToJSONFilePath,
    JSON.stringify(ipLog, null, 2),
    (err) => {
      if (err) {
        console.error("❌ Error saving IP data:", err);
      } else {
        console.log("✅ IP data saved successfully.");
      }
    }
  );
}
module.exports = saveIPDataToJSON;
