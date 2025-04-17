require("dotenv").config();
require("./models/associations");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const sequelize = require("./config/database");
const initializeDatabase = require("./config/initDatabase");
const feedStockService = require("./controllers/feedStockMonitoring");

// Import Routes
const FeedType = require("./routes/feedTypeRoutes");
const Feed = require("./routes/feedRoutes");
const FeedStock = require("./routes/feedStockRoutes");
const DailyFeedComplete = require("./routes/dailyFeedCompleteRoutes");
const DailyFeedItems = require("./routes/dailyFeedItemRoutes");
const DailyFeedNutrients = require("./routes/dailyFeedNutrientsRoutes");
const Notification = require("./routes/notificationRoutes");

// Inisialisasi database
initializeDatabase();

const app = express();

// Middleware keamanan tambahan
app.use(helmet());

// Middleware CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
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

const scheduleStockCheck = () => {
  setInterval(async () => {
    try {
      await feedStockService.monitorFeedStockLevels();
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
  .then(() => console.log("✅ Database ready"))
  .catch((err) => console.error("❌ Database sync error:", err));

// Routes
app.use("/api/feedType", FeedType);
app.use("/api/feed", Feed);
app.use("/api/feedStock", FeedStock);
app.use("/api/dailyFeedComplete", DailyFeedComplete);
app.use("/api/dailyFeedItem", DailyFeedItems);
app.use("/api/dailyFeedNutrients", DailyFeedNutrients);
app.use("/api/notification", Notification);

// Middleware untuk menangani endpoint yang tidak ditemukan
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found!" });
});

// Jalankan server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});