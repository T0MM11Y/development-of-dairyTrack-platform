require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const sequelize = require("./config/database");
const initializeDatabase = require("./config/initDatabase");
// const feedStockService = require("./controllers/feedStockMonitoring");

// Impor fungsi defineAssociations
const defineAssociations = require("./models/associations");

// Impor semua model untuk memastikan inisialisasi
const User = require("./models/userModel");
const FeedType = require("./models/feedTypeModel");
const Feed = require("./models/feedModel");
const Nutrisi = require("./models/nutritionModel");
const FeedNutrisi = require("./models/feedNutritionModel");
const DailyFeedSchedule = require("./models/dailyFeedSchedule");
const DailyFeedItems = require("./models/dailyFeedItemsModel");
const FeedStock = require("./models/feedStockModel");
const Notification = require("./models/notificationModel");

// Import Routes
const FeedTypeRoutes = require("./routes/feedTypeRoutes");
const FeedRoutes = require("./routes/feedRoutes");
const NutritionRoutes = require("./routes/nutritionRoutes");
const FeedStockRoutes = require("./routes/feedStockRoutes");
const DailyFeedScheduleRoutes = require("./routes/dailyFeedScheduleRoutes");
const DailyFeedItemsRoutes = require("./routes/dailyFeedItemRoutes");
const NotificationRoutes = require("./routes/notificationRoutes");

// Jalankan asosiasi
defineAssociations();

// Inisialisasi database
initializeDatabase();

const app = express();

// Middleware keamanan tambahan
app.use(helmet());

// Middleware CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:51640"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middleware untuk parsing JSON dan URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk logging request dengan timestamp
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Fungsi untuk menjadwalkan pengecekan stok pakan
const scheduleStockCheck = () => {
  setInterval(async () => {
    try {
      await feedStockService.monitorFeedStockLevels();
      console.log("Feed stock levels checked successfully");
    } catch (error) {
      console.error("Scheduled feed stock check failed:", error);
    }
  }, 60 * 60 * 1000); // Check every hour
};

// Start the scheduled job
scheduleStockCheck();

// Sinkronisasi database
const syncOption = process.env.DB_SYNC_ALTER === "true" ? { alter: true } : {};
sequelize
  .sync(syncOption)
  .then(() => {
    console.log("✅ Database synchronized successfully");
  })
  .catch((err) => {
    console.error("❌ Database sync error:", err);
  });

// Routes
app.use("/feedType", FeedTypeRoutes);
app.use("/feed", FeedRoutes);
app.use("/nutrition", NutritionRoutes);
app.use("/feedStock", FeedStockRoutes);
app.use("/dailyFeedSchedule", DailyFeedScheduleRoutes);
app.use("/dailyFeedItem", DailyFeedItemsRoutes);
app.use("/notification", NotificationRoutes);

// Middleware untuk menangani endpoint yang tidak ditemukan
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
});

// Jalankan server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
