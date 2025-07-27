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


const Iplog = mongoose.model("Iplog", ipLogSchema);
module.exports = Iplog;
