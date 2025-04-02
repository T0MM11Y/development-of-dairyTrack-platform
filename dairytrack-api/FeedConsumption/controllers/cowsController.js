const Cows = require("../models/cowsModel.js");



exports.getAllCows = async (req, res) => {
  try {
    const cows = await Cows.findAll();
    res.status(200).json({ success: true, cows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
