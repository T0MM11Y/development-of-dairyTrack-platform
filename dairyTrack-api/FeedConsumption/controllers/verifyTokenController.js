const { validate: isUuid } = require("uuid");
const User = require("../models/userModel");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token is required" });
  }

  const token = authHeader.split(" ")[1];
  if (!isUuid(token)) {
    return res.status(401).json({ success: false, message: "Invalid token format" });
  }

  try {
    const user = await User.findOne({
      where: { token },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const tokenCreatedAt = user.token_created_at;
    const TOKEN_EXPIRATION = 3600 * 1000;
    if (tokenCreatedAt && Date.now() - new Date(tokenCreatedAt).getTime() > TOKEN_EXPIRATION) {
      return res.status(401).json({ success: false, message: "Token has expired" });
    }

    req.user = { id: user.id };
    next();
  } catch (err) {
    console.error("Error in verifyToken:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { verifyToken };