import User from "../models/User.js";
import { uploadToR2 } from "../utils/r2-upload.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) {
      user.name = name;
    }

    // Handle profile image upload
    if (req.file) {
      const imageUrl = await uploadToR2(req.file, "profiles");
      user.profileImage = imageUrl;
    }

    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
