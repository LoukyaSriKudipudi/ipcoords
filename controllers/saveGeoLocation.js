const GeoLocation = require("./../models/geoLocationModel");

const saveGeoLocation = async (data) => {
  try {
    const doc = await GeoLocation.create({ raw: data });
    console.log("✅ Direct Nominatim data saved:", doc._id);
  } catch (err) {
    console.error("❌ Failed to save:", err.message);
  }
};

module.exports = saveGeoLocation;
