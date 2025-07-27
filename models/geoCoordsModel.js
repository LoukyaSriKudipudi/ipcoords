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
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const GeoCoord = mongoose.model("GeoCoord", geoCoordSchema);
module.exports = GeoCoord;
