const Restaurant = require("../models/Restaurant");
const mongoose = require("mongoose");

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const addRestaurant = async (req, res) => {
  try {
    const {
      name,
      cuisine,
      address,
      location,
      price,
      image,
      imagePublicId,
      status,
      rating,
      tags,
      links,
      note
    } = req.body;

    const restaurant = await Restaurant.create({
      userId: req.user.id,
      name,
      cuisine,
      address,
      location: {
        coordinates: location?.coordinates
      },
      price,
      image: image || "",
      imagePublicId: imagePublicId || "",
      status: status || "want_to_try",
      rating,
      tags,
      links,
      note
    });

    return res.status(201).json({
      success: true,
      message: "Restaurant added successfully",
      data: restaurant
    });

  } catch (error) {
    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while adding restaurant"
    });
  }
};

const getUserRestaurants = async (req, res) => {
  try {
    const {
      view,
      search,
      price,
      rating,
      cuisine,
      tags,
      status,
      limit: requestedLimit,
      cursor
    } = req.query;

    const selectedView = view || "list";

    if (!["list", "map"].includes(selectedView)) {
      return res.status(400).json({
        success: false,
        message: "Invalid view. Use list or map."
      });
    }

    // Validate pagination limit for list mode only.
    const limit = requestedLimit === undefined
      ? 20
      : Number(requestedLimit);

    if (
      selectedView === "list" &&
      (!Number.isInteger(limit) || limit < 1 || limit > 50)
    ) {
      return res.status(400).json({
        success: false,
        message: "Limit must be an integer between 1 and 50."
      });
    }

    const filter = {
      userId: req.user.id
    };

    // Search across restaurant name, address, and cuisine.
    const searchTerm = search?.trim();

    if (searchTerm) {
      const regex = {
        $regex: escapeRegex(searchTerm),
        $options: "i"
      };

      filter.$and = [
        {
          $or: [
            { name: regex },
            { address: regex },
          ]
        }
      ];
    }

    // Filter by price.
    if (price) {
      const allowedPrices = [
        "budget",
        "moderate",
        "expensive"
      ];

      if (!allowedPrices.includes(price)) {
        return res.status(400).json({
          success: false,
          message: "Invalid price filter."
        });
      }

      filter.price = price;
    }

    // Filter by rating.
    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be an integer between 1 and 5."
        });
      }

      filter.rating = numericRating;
    }

    // Filter by tags.
    if (tags) {
      const selectedTags = tags
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean);

      if (selectedTags.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid tags."
        });
      }

      filter.tags = {
        $in: selectedTags
      };
    }

    // Filter by cuisine
    if (cuisine) {
      const selectedCuisines = cuisine
        .split(",")
        .map(c => c.trim())
        .filter(Boolean);

      if (selectedCuisines.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid cuisines."
        });
      }

      filter.cuisine = {
        $in: selectedCuisines
      };
    }

    // list mode
    if (selectedView === "list") {
      const selectedStatus = status || "want_to_try";

      if (!["been", "want_to_try"].includes(selectedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid restaurant status."
        });
      }

      filter.status = selectedStatus;
    }

    // map mode
    if (selectedView === "map") {
      const restaurants = await Restaurant.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        count: restaurants.length,
        data: restaurants
      });
    }

    // Decode and validate pagination cursor.
    if (cursor) {
      let decodedCursor;

      try {
        decodedCursor = JSON.parse(
          Buffer.from(cursor, "base64url").toString("utf8")
        );
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid pagination cursor."
        });
      }

      const cursorDate = new Date(decodedCursor.createdAt);
      const cursorId = decodedCursor._id;

      if (
        !decodedCursor.createdAt ||
        Number.isNaN(cursorDate.getTime()) ||
        !mongoose.Types.ObjectId.isValid(cursorId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid pagination cursor."
        });
      }

      // Continue after the last restaurant from the previous batch.
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { createdAt: { $lt: cursorDate } },
            {
              createdAt: cursorDate,
              _id: { $lt: new mongoose.Types.ObjectId(cursorId) }
            }
          ]
        }
      ];
    }

    const restaurants = await Restaurant.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = restaurants.length > limit;

    if (hasMore) {
      restaurants.pop();
    }

    // Generate next cursor from the last returned restaurant.
    let nextCursor = null;

    if (hasMore && restaurants.length > 0) {
      const lastRestaurant = restaurants[restaurants.length - 1];

      nextCursor = Buffer.from(
        JSON.stringify({
          createdAt: lastRestaurant.createdAt,
          _id: lastRestaurant._id
        })
      ).toString("base64url");
    }

    return res.status(200).json({
      success: true,
      count: restaurants.length,
      hasMore,
      nextCursor,
      data: restaurants
    });

  } catch (error) {
    console.error("Get restaurants error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID."
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: id,
      userId: req.user.id
    }).lean();

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found."
      });
    }

    return res.status(200).json({
      success: true,
      data: restaurant
    });

  } catch (error) {
    console.error("Get restaurant details error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching restaurant details."
    });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID."
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found."
      });
    }

    const hasField = (field) =>
      Object.prototype.hasOwnProperty.call(body, field);

    const allowedFields = [
      "name",
      "cuisine",
      "address",
      "location",
      "price",
      "image",
      "imagePublicId",
      "status",
      "rating",
      "tags",
      "links",
      "note"
    ];

    const requestedFields = Object.keys(body);

    const invalidFields = requestedFields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Fields cannot be updated: ${invalidFields.join(", ")}`
      });
    }

    if (requestedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update."
      });
    }

    if (
      hasField("status") &&
      !["been", "want_to_try"].includes(body.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant status."
      });
    }

    if (
      restaurant.status === "been" &&
      body.status === "want_to_try"
    ) {
      return res.status(400).json({
        success: false,
        message: "A Been restaurant cannot be moved back to Want to Try."
      });
    }

    const isTransitioningToBeen =
      restaurant.status === "want_to_try" &&
      body.status === "been";

    if (restaurant.status === "want_to_try") {
      if (hasField("rating") && body.rating !== null && !isTransitioningToBeen) {
        return res.status(400).json({
          success: false,
          message: "Want to Try restaurants must not have ratings."
        });
      }
      // for making a want to try rest as been, the rating is required.
      if (isTransitioningToBeen) {
        if (
          !hasField("rating") ||
          !Number.isInteger(body.rating) ||
          body.rating < 1 ||
          body.rating > 5
        ) {
          return res.status(400).json({
            success: false,
            message: "A valid integer rating between 1 and 5 is required to move a restaurant to Been."
          });
        }
      }
    } else if (restaurant.status === "been") {
      // this is for editing an already been restaurant rating
      if (
        hasField("rating") &&
        (
          !Number.isInteger(body.rating) ||
          body.rating < 1 ||
          body.rating > 5
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be an integer between 1 and 5."
        });
      }
    }

    if (hasField("address") && !hasField("location")) {
      return res.status(400).json({
        success: false,
        message: "Please provide the confirmed map location when updating the address."
      });
    }

    if (hasField("location")) {
      const coordinates = body.location?.coordinates;

      if (
        !body.location ||
        typeof body.location !== "object" ||
        Array.isArray(body.location) ||
        !Array.isArray(coordinates) ||
        coordinates.length !== 2
      ) {
        return res.status(400).json({
          success: false,
          message: "Location must contain exactly two coordinates: longitude and latitude."
        });
      }

      const [longitude, latitude] = coordinates;

      if (
        typeof longitude !== "number" ||
        typeof latitude !== "number" ||
        !Number.isFinite(longitude) ||
        !Number.isFinite(latitude) ||
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid longitude and latitude values."
        });
      }
    }

    const editableFields = [
      "name",
      "cuisine",
      "address",
      "price",
      "image",
      "imagePublicId",
      "tags",
      "links",
      "note"
    ];

    editableFields.forEach((field) => {
      if (hasField(field)) {
        restaurant[field] = body[field];
      }
    });

    if (hasField("location")) {
      restaurant.location = {
        type: "Point",
        coordinates: body.location.coordinates
      };
    }

    if (hasField("status")) {
      restaurant.status = body.status;
    }

    // 12. Update rating if provided.
    if (hasField("rating")) {
      restaurant.rating = body.rating;
    }

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: isTransitioningToBeen
        ? "Restaurant successfully marked as ranked."
        : "Restaurant updated successfully.",
      data: restaurant
    });

  } catch (error) {
    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.error("Update restaurant error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating restaurant."
    });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID."
      });
    }

    const restaurant = await Restaurant.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found."
      });
    }

    let imageCleanupFailed = false;

    if (restaurant.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(
          restaurant.imagePublicId,
          {
            resource_type: "image"
          }
        );
      } catch (cloudinaryError) {
        imageCleanupFailed = true;

        console.error(
          "Cloudinary image deletion error:",
          cloudinaryError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully."
    });
  } catch (error) {
    console.error("Delete restaurant error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting restaurant."
    });
  }
}

const getNearbyRestaurants = async (req, res) => {
  try {
    const {
      north,
      south,
      east,
      west,
      search,
      price,
      rating,
      cuisine,
      tags,
    } = req.query;

    const boundaryValues = { north, south, east, west };

    for (const [key, value] of Object.entries(boundaryValues)) {
      if (value === undefined || value.trim() === "" || !Number.isFinite(Number(value))) {
        return res.status(400).json({
          success: false,
          message: `A valid ${key} boundary is required.`
        });
      }
    }

    const northLat = Number(north);
    const southLat = Number(south);
    const eastLng = Number(east);
    const westLng = Number(west);

    if (
      northLat < -90 ||
      northLat > 90 ||
      southLat < -90 ||
      southLat > 90 ||
      eastLng < -180 ||
      eastLng > 180 ||
      westLng < -180 ||
      westLng > 180 ||
      northLat <= southLat
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid map boundaries."
      });
    }

    const filter = {
      userId: req.user.id
    };

    const searchTerm = search?.trim();

    if (searchTerm) {
      const regex = {
        $regex: escapeRegex(searchTerm),
        $options: "i"
      };

      filter.$and = [
        {
          $or: [
            { name: regex },
            { address: regex },
          ]
        }
      ];
    }

    if (price) {
      const allowedPrices = [
        "budget",
        "moderate",
        "expensive"
      ];

      if (!allowedPrices.includes(price)) {
        return res.status(400).json({
          success: false,
          message: "Invalid price filter."
        });
      }

      filter.price = price;
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be an integer between 1 and 5."
        });
      }

      filter.rating = numericRating;
    }

    if (tags) {
      const selectedTags = tags
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean);

      if (selectedTags.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid tags."
        });
      }

      filter.tags = {
        $in: selectedTags
      };
    }

    if (cuisine) {
      const selectedCuisines = cuisine
        .split(",")
        .map(c => c.trim())
        .filter(Boolean);

      if (selectedCuisines.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid cuisines."
        });
      }

      filter.cuisine = {
        $in: selectedCuisines
      };
    }

    const createPolygon = (westBoundary, eastBoundary) => ({
      type: "Polygon",
      coordinates: [[
        [westBoundary, southLat],
        [eastBoundary, southLat],
        [eastBoundary, northLat],
        [westBoundary, northLat],
        [westBoundary, southLat]
      ]]
    });

    let geoFilter;

    if (westLng <= eastLng) {
      geoFilter = {
        location: {
          $geoWithin: {
            $geometry: createPolygon(westLng, eastLng)
          }
        }
      };
    } else {
      // Map area crosses the International Date Line.
      geoFilter = {
        $or: [
          {
            location: {
              $geoWithin: {
                $geometry: createPolygon(westLng, 180)
              }
            }
          },
          {
            location: {
              $geoWithin: {
                $geometry: createPolygon(-180, eastLng)
              }
            }
          }
        ]
      };
    }

    const restaurants = await Restaurant.find({
      $and: [
        filter,
        geoFilter
      ]
    })
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    console.error("Error getting restaurants:", error);

    return res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
}

const getRestaurantFilters = async (req, res) => {
  try {
    const userId = req.user.id;

    const [tags, cuisines] = await Promise.all([
      Restaurant.distinct("tags", { userId }),
      Restaurant.distinct("cuisine", { userId })
    ]);

    const normalizeOptions = (values) => {
      const uniqueValues = new Map();

      values.forEach((value) => {
        if (typeof value !== "string" || !value.trim()) return;

        const trimmedValue = value.trim();
        const key = trimmedValue.toLowerCase();

        if (!uniqueValues.has(key)) {
          uniqueValues.set(key, trimmedValue);
        }
      });

      return [...uniqueValues.values()].sort((a, b) =>
        a.localeCompare(b)
      );
    };

    return res.status(200).json({
      success: true,
      data: {
        tags: normalizeOptions(tags),
        cuisines: normalizeOptions(cuisines),
      }
    });

  } catch (error) {
    console.error("Get restaurant filters error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching restaurant filters."
    });
  }
};

const LATLNG_AUTOSUGGEST_URL =
  'https://suggest.latlng.work/autosuggest';

const searchLocations = async (req, res) => {
  const controller = new AbortController();
  let timeout;

  try {
    const { q } = req.query;

    if (typeof q !== 'string' || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required.',
      });
    }

    const lat = Number(req.query.lat ?? 24.8607);
    const lon = Number(req.query.lon ?? 67.0011);
    const radius = Number(req.query.radius ?? 25000);
    const limit = Number(req.query.limit ?? 10);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      !Number.isFinite(radius) ||
      !Number.isInteger(limit) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180 ||
      radius <= 0 ||
      limit < 1 ||
      limit > 10
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search parameters.',
      });
    }

    const apiKey = process.env.LATLNG_MAPS_API_KEY;

    if (!apiKey) {
      console.error('LATLNG_MAPS_API_KEY is missing.');

      return res.status(500).json({
        success: false,
        message: 'Place search is not configured.',
      });
    }

    const params = new URLSearchParams({
      q: q.trim(),
      lat: String(lat),
      lon: String(lon),
      radius: String(radius),
      country: 'pk',
      limit: String(limit),
    });

    timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `${LATLNG_AUTOSUGGEST_URL}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey,
        },
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const errorDetails = await response.text();

      console.error('LatLng API error:', {
        status: response.status,
        details: errorDetails,
      });

      return res.status(502).json({
        success: false,
        message: 'Place search provider failed.',
      });
    }

    const data = await response.json();

    const suggestions = Array.isArray(data.suggestions)
      ? data.suggestions
      : [];

    return res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (error) {
    console.error('Place search error:', error);

    if (error.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        message: 'Place search request timed out.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to search places.',
    });
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = {
  addRestaurant,
  getUserRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  getNearbyRestaurants,
  getRestaurantFilters,
  searchLocations,
};
