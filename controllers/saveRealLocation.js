const GeoCoord = require("./../models/geoCoordsModel");

const saveRealLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const newGeoCoords = await GeoCoord.create({ latitude, longitude });

  

    res.status(201).json({
      status: "success",
      data: {
        location: newGeoCoords,
      },
    });
  } catch (err) {
    console.error("❌ Failed to save Geo Coordinates data:", err.message);
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

module.exports = saveRealLocation;
