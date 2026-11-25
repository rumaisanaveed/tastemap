const multer = require("multer");

// Store uploaded files temporarily in memory
const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
    const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error("Only JPEG, JPG, PNG, and WebP images are allowed."));
  }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

const imageUploadMiddleware = (req, res, next) => {
    upload.single("image")(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message:
                error.code === "LIMIT_FILE_SIZE"
                    ? "Image size cannot exceed 5 MB."
                    : error.message
            });
        }

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        };

        next();
    });
};

module.exports = imageUploadMiddleware;