const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
    addRestaurant, getUserRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant,
    getNearbyRestaurants,
    getRestaurantFilters,
    searchLocations
} = require("../controllers/restaurantController");

// add restaurant
router.post("/add", protect, addRestaurant);
router.get("/", protect, getUserRestaurants);
router.get("/filters", protect, getRestaurantFilters);
router.get("/nearby", protect, getNearbyRestaurants);
router.get("/search", searchLocations);
router.get("/:id", protect, getRestaurantById);
router.patch("/:id", protect, updateRestaurant);
router.delete("/:id", protect, deleteRestaurant);
router.get("/filters", protect, getRestaurantFilters);

module.exports = router;