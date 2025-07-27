const mongoose = require("mongoose");

const geoCoordSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  timestampUTC: {
    type: Date,
    default: Date.now,
  },
  timestampIST: {
    type: String,
    default: () =>
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
  },
});

const GeoCoord = mongoose.model("GeoCoord", geoCoordSchema);
module.exports = GeoCoord;
