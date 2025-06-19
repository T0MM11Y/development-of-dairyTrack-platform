const { validate: isUuid } = require("uuid");
const User = require("../models/userModel");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Anda belum login, silahkan login terlebih dahulu",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!isUuid(token)) {
    return res.status(401).json({
      success: false,
      message: "Format token tidak valid",
    });
  }

  try {
    const user = await User.findOne({ where: { token } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid atau telah kedaluwarsa",
      });
    }

    const tokenCreatedAt = user.token_created_at;
    const TOKEN_EXPIRATION = 3600 * 1000; // 1 jam
    if (tokenCreatedAt && Date.now() - new Date(tokenCreatedAt).getTime() > TOKEN_EXPIRATION) {
      return res.status(401).json({
        success: false,
        message: "Token telah kedaluwarsa",
      });
    }

    // Petakan role_id ke string role
    const roleMap = {
      1: "Admin",
      2: "Supervisor",
      3: "Farmer",
    };
    const role = roleMap[user.role_id] || "Unknown"; // Asumsi kolom 'role_id' di database

    req.user = { id: user.id, role };
    next();
  } catch (err) {
    console.error("Error in verifyToken:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

const validateAdminFarmerCRUD = (req, res, next) => {
  const { role } = req.user;
  const method = req.method;

  // Admin dan Farmer bisa melakukan semua operasi (CRUD)
  if (["Admin", "Farmer"].includes(role)) {
    return next();
  }

  // Supervisor hanya bisa READ (GET)
  if (role === "Supervisor" && method === "GET") {
    return next();
  }

  // Jika Supervisor mencoba POST, PUT, atau DELETE
  if (role === "Supervisor") {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Supervisor hanya dapat melihat data, tidak dapat melakukan perubahan.",
    });
  }

  // Role tidak valid
  return res.status(403).json({
    success: false,
    message: "Role tidak valid atau tidak memiliki akses.",
  });
};

const validateFarmerOnly = (req, res, next) => {
  const { role } = req.user;
  const method = req.method;

  // Farmer bisa melakukan semua operasi (CRUD)
  if (role === "Farmer") {
    return next();
  }

  // Admin dan Supervisor hanya bisa READ (GET)
  if (["Admin", "Supervisor"].includes(role) && method === "GET") {
    return next();
  }

  // Jika Admin atau Supervisor mencoba POST, PUT, atau DELETE
  if (["Admin", "Supervisor"].includes(role)) {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Hanya Farmer yang dapat menambah, mengedit, atau menghapus jadwal maupun item pakan.",
    });
  }

  // Role tidak valid
  return res.status(403).json({
    success: false,
    message: "Role tidak valid atau tidak memiliki akses.",
  });
};
const validateAdminOnly = (req, res, next) => {
  const { role } = req.user;
  const method = req.method;

  // Farmer bisa melakukan semua operasi (CRUD)
  if (role === "Admin") {
    return next();
  }

  // Admin dan Supervisor hanya bisa READ (GET)
  if (["Farmer", "Supervisor"].includes(role) && method === "GET") {
    return next();
  }

  // Jika Admin atau Supervisor mencoba POST, PUT, atau DELETE
  if (["Farmer", "Supervisor"].includes(role)) {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Hanya Admin yang dapat menghapus data ini",
    });
  }

  // Role tidak valid
  return res.status(403).json({
    success: false,
    message: "Role tidak valid atau tidak memiliki akses.",
  });
};

module.exports = {
  verifyToken,
  validateAdminFarmerCRUD,
  validateFarmerOnly,
  validateAdminOnly
};