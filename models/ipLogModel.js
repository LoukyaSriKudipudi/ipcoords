const mongoose = require("mongoose");

const ipLogSchema = new mongoose.Schema({
  ip: String,
  city: String,
  region: String,
  country: String,
  loc: String,
  org: String,
  postal: String,
  timezone: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Iplog = mongoose.model("Iplog", ipLogSchema);
module.exports = Iplog;
