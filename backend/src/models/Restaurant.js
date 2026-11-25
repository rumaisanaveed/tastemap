const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    cuisine: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    // [longitude, latitude]
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (coordinates) {
            return (
              coordinates.length === 2 &&
              coordinates[0] >= -180 &&
              coordinates[0] <= 180 &&
              coordinates[1] >= -90 &&
              coordinates[1] <= 90
            );
          },
          message: "Coordinates must contain valid longitude and latitude"
        }
      }
    },
    price: {
      type: String,
      enum: ["budget", "moderate", "expensive"],
      required: true
    },
    image: {
      type: String,
      default : "",
    },
    // cd assigns this public id to images
    imagePublicId: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["want_to_try", "been"],
      required: true,
      default: "want_to_try"
    },
    // required when status is "been"
    rating: {
      type: Number,
      min: [1, "Rating must be atleast 1."],
      max: [5, "Rating cannot be greater than 5."],
      required : function () {
        return this.status === "been"
      },
      validate: {
        validator: function (value) {
          if (this.status === "been") {
            return Number.isInteger(value);
          }
          return value == null;
        },
        message: "Rating must be between 1 to 5."
      }
    },
    // optional 
    tags: {
      type: [String],
      default: []
    },
    // optional - corresponds to the links showing the restaurant
    links: {
      type: [String],
      default: []
    },
    // optional
    note: {
      type: String,
      trim: true,
      default: ""
    },
  },
  {
    timestamps: true
  }
);

restaurantSchema.index({ location: "2dsphere" });

// Efficient retrieval of a user's restaurants
restaurantSchema.index({ userId: 1, createdAt: -1, _id: -1 });

module.exports = mongoose.model("Restaurant", restaurantSchema);
