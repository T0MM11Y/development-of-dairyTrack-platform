require("dotenv").config();
require("./models/associations"); // Inisialisasi hubungan antar model
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const sequelize = require("./config/database");
const initializeDatabase = require("./config/initDatabase");

// Import Routes
const FeedType = require("./routes/feedTypeRoutes");
const Feed = require("./routes/feedRoutes");
const FeedStock = require("./routes/feedStockRoutes");
const DailyFeed = require("./routes/dailyFeedRoutes");
const DailyFeedDetail = require("./routes/dailyFeedDetailRoutes");
const DailyFeedSession = require("./routes/dailyFeedSessionRoutes");
const DailyFeedComplete = require("./routes/dailyFeedCompleteRoutes");
const DailyFeedItems = require("./routes/dailyFeedItemRoutes");


// Inisialisasi database
initializeDatabase();

const app = express();

// Middleware keamanan tambahan
app.use(helmet());

// Middleware CORS
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173"], 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

// Middleware untuk parsing JSON dan URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sinkronisasi database (Dikontrol dari .env)
const syncOption = process.env.DB_SYNC_ALTER === "true" ? { alter: true } : {};
sequelize.sync(syncOption)
    .then(() => console.log("✅ Database synchronized"))
    .catch(err => console.error("❌ Error syncing database:", err));

// Routes
app.use("/api/feedType", FeedType);
app.use("/api/feed", Feed);
app.use("/api/feedStock", FeedStock);
app.use("/api/dailyFeed", DailyFeed);
app.use("/api/dailyFeedDetail", DailyFeedDetail);
app.use("/api/dailyFeedSessions", DailyFeedSession);
app.use("/api/dailyFeedComplete", DailyFeedComplete);
app.use("/api/dailyFeedItem", DailyFeedItems);

// Middleware untuk menangani endpoint yang tidak ditemukan
app.use((req, res) => {
    res.status(404).json({ message: "Endpoint not found!" });
});

// Jalankan server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
