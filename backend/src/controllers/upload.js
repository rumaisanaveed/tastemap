const cloudinary = require("../config/cloudinary");

function uploadToCloudinary(fileBuffer, userId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `tastemap/users/${userId}/restaurants`,
        resource_type: "image"
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          image: result.secure_url,
          imagePublicId: result.public_id
        });
      }
    );

    stream.end(fileBuffer);
  });
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image to upload."
      });
    }

    const uploadedImage = await uploadToCloudinary(
      req.file.buffer,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: uploadedImage
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = uploadImage;
