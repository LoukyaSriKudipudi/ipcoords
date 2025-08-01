const Iplog = require("./../models/ipLogModel");

const saveIpInfo = async (data) => {
  try {
    const newIpLog = await Iplog.create(data);
    } catch (err) {
    console.error("❌ Failed to save IP data:", err.message);
  }
};

module.exports = saveIpInfo;
