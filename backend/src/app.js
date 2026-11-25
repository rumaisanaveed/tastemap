const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const cookieParser = require("cookie-parser");
const protect = require("./middleware/authMiddleware");
const imageUploadMiddleware = require("./middleware/multerMiddleware");
const uploadImage = require("./controllers/upload");

const app = express();

// Middlewares
app.use(cors());
// allows Express to read JSON request bodies.
app.use(express.json());
app.use(cookieParser());

// auth routes
app.use("/api/auth", authRoutes);
// restaurant
app.use("/api/restaurants", restaurantRoutes);
// upload
app.post(
  "/api/upload",
  protect,
  imageUploadMiddleware,
  uploadImage,
);

module.exports = app;