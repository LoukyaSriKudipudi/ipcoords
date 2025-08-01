// models/geoCoordsModel.js

const mongoose = require("mongoose");

const geoLocationSchema = new mongoose.Schema(
  {
    raw: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    source: {
      type: String,
      default: "nominatim",
    },
    timestamp: {
      type: Date,
      default: () =>
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    },
  },
  { strict: false } // VERY IMPORTANT: allows any other fields from the raw data
);

module.exports = mongoose.model("GeoLocation", geoLocationSchema);
