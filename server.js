const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const summaryRoutes = require("./routes/summaryRoutes");
const nhlRoutes = require("./routes/nhlRoutes");
const { authMiddleware } = require("./middleware/authMiddleware");
const { trackUsage } = require("./middleware/trackUsage");
const { logEndPoints } = require("./middleware/logEndPoints");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "https://comp4537api.ziqil.com",
  "http://localhost:8003",
  "http://localhost:5500",
  "https://comp4537.ziqil.com",
  "https://victoorwong.github.io",
];

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true); // Allow the origin
      } else {
        callback(new Error("Not allowed by CORS")); // Reject the origin
      }
    },
    credentials: true, // Allow cookies and credentials to be sent
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow these methods for cross-origin requests
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"], // Allow these headers in the request
  })
);

app.options("*", cors());

app.use("/", express.static("public"));
app.use("/api", authMiddleware, trackUsage, logEndPoints);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/nhl", nhlRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
