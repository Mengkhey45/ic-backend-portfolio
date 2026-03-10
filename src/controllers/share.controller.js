import ShareLink from "../models/ShareLink.js";
import crypto from "crypto";

export const createShareLink = async (req, res) => {
  try {
    const { isPortfolioLink, expiresAt, projectId, privateNote, allowedCategories, allowedProjects } = req.body;
    
    const token = crypto.randomBytes(32).toString("hex");
    
    // Auto-generate 6-digit access code
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const shareLink = await ShareLink.create({
      token,
      expiresAt: new Date(expiresAt),
      isPortfolioLink,
      projectId: projectId || null,
      privateNote: privateNote || "",
      accessCode: accessCode,
      allowedCategories: allowedCategories || [],
      allowedProjects: allowedProjects || []
    });
    
    res.status(201).json(shareLink);
  } catch (error) {
    res.status(500).json({ message: "Error generating share link" });
  }
};

export const getShareLinks = async (req, res) => {
  try {
    const shareLinks = await ShareLink.find().sort({ createdAt: -1 });
    res.json({ shareLinks });
  } catch (error) {
    res.status(500).json({ message: "Error fetching share links" });
  }
};

export const deleteShareLink = async (req, res) => {
  try {
    const { id } = req.params;
    const shareLink = await ShareLink.findByIdAndDelete(id);
    if (!shareLink) {
      return res.status(404).json({ message: "Share link not found" });
    }
    res.json({ message: "Share link deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting share link" });
  }
};
