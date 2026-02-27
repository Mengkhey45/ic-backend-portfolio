import Project from "../models/Project.js";
import Category from "../models/Category.js";
import ShareLink from "../models/ShareLink.js";

export const getPublicPortfolio = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Find and validate share link
    const shareLink = await ShareLink.findOne({ token });
    if (!shareLink) {
      return res.status(404).json({ message: "Invalid or expired share link" });
    }

    if (new Date() > shareLink.expiresAt) {
      return res.status(404).json({ message: "Invalid or expired share link" });
    }

    let projects;
    if (shareLink.isPortfolioLink) {
      // Get all non-hidden projects
      projects = await Project.find({ isHidden: false })
        .populate("category")
        .sort({ createdAt: -1 });
    } else {
      // Get only the specific project
      projects = await Project.find({ 
        _id: shareLink.projectId,
        isHidden: false 
      }).populate("category");
    }

    const categories = await Category.find();

    res.json({ projects, categories });
  } catch (error) {
    console.error("Public portfolio error:", error);
    res.status(500).json({ message: "Error fetching portfolio" });
  }
};
