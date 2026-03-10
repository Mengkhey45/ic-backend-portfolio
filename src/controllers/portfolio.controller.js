import Project from "../models/Project.js";
import Category from "../models/Category.js";
import ShareLink from "../models/ShareLink.js";

export const getPublicPortfolio = async (req, res) => {
  try {
    const { token, accessCode } = req.query;

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

    // Check for access code (Mandatory)
    if (!accessCode || shareLink.accessCode !== accessCode) {
      return res.status(403).json({ 
        message: "Access code required", 
        codeRequired: true 
      });
    }

    let projects;
    let categoryQuery = {};

    if (shareLink.isPortfolioLink) {
      const projectQuery = { isHidden: false };
      
      // If allowedCategories are specified, filter projects by them
      if (shareLink.allowedCategories && shareLink.allowedCategories.length > 0) {
        projectQuery.category = { $in: shareLink.allowedCategories };
        categoryQuery = { _id: { $in: shareLink.allowedCategories } };
      }
      
      projects = await Project.find(projectQuery)
        .populate("category")
        .sort({ createdAt: -1 });
    } else {
      // Get specific project(s)
      const ids = shareLink.projectIds?.length > 0 
        ? shareLink.projectIds 
        : shareLink.projectId ? [shareLink.projectId] : [];
      projects = await Project.find({ 
        _id: { $in: ids },
        isHidden: false 
      }).populate("category").sort({ createdAt: -1 });
    }

    const categories = await Category.find(categoryQuery);

    res.json({ projects, categories });
  } catch (error) {
    console.error("Public portfolio error:", error);
    res.status(500).json({ message: "Error fetching portfolio" });
  }
};
