import Project from "../models/Project.js";
import { uploadToR2 } from "../utils/r2-upload.js";
import getRedisClient from "../config/redis.js";

const CACHE_KEY = "projects:all";
const CACHE_EXPIRATION = 3600; // 1 hour

/**
 * Helper to invalidate projects cache
 */
const invalidateCache = async () => {
  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.del(CACHE_KEY);
      console.log("Projects cache invalidated 🔄");
    }
  } catch (error) {
    console.warn("Redis cache invalidation failed:", error.message);
  }
};

export const getProjects = async (req, res) => {
  try {
    const redis = getRedisClient();
    
    // Try to get from cache first
    if (redis) {
      try {
        const cachedData = await redis.get(CACHE_KEY);
        if (cachedData) {
          console.log("Serving projects from cache ⚡");
          return res.json({ projects: JSON.parse(cachedData) });
        }
      } catch (redisError) {
        console.warn("Redis GET failed, falling back to DB:", redisError.message);
      }
    }

    const projects = await Project.find()
      .populate("category")
      .sort({ createdAt: -1 });

    // Save to cache for next time
    if (redis && projects.length > 0) {
      try {
        await redis.set(CACHE_KEY, JSON.stringify(projects), "EX", CACHE_EXPIRATION);
        console.log("Projects cached 💾");
      } catch (redisError) {
        console.warn("Redis SET failed:", redisError.message);
      }
    }

    res.json({ projects });
  } catch (error) {
    console.error("Fetch projects error:", error);
    res.status(500).json({ message: "Error fetching projects" });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description, category, label, isHidden, links } = req.body;
    
    let thumbnail = "";
    const media = [];

    // Handle thumbnail
    if (req.files?.thumbnail?.[0]) {
      thumbnail = await uploadToR2(req.files.thumbnail[0], "thumbnails");
    }

    // Handle images
    if (req.files?.images) {
      for (const file of req.files.images) {
        const url = await uploadToR2(file, "media/images");
        media.push({ type: "image", url, title: file.originalname });
      }
    }

    // Handle video
    if (req.files?.video?.[0]) {
      const url = await uploadToR2(req.files.video[0], "media/videos");
      media.push({ type: "video", url, title: req.files.video[0].originalname });
    }

    // Handle pdf
    if (req.files?.pdf?.[0]) {
      const url = await uploadToR2(req.files.pdf[0], "media/pdfs");
      media.push({ type: "pdf", url, title: req.files.pdf[0].originalname });
    }

    // Parse links
    let parsedLinks = [];
    if (Array.isArray(links)) {
      parsedLinks = links.filter(l => l && l.trim() !== "");
    } else if (typeof links === "string") {
      try {
        parsedLinks = JSON.parse(links);
        if (!Array.isArray(parsedLinks)) parsedLinks = [parsedLinks];
      } catch (e) {
        parsedLinks = links.split(",").map(l => l.trim()).filter(l => l !== "");
      }
    }

    const project = await Project.create({
      title,
      description,
      category,
      label,
      isHidden: isHidden === "true" || isHidden === true,
      thumbnail,
      media,
      links: parsedLinks
    });

    const populatedProject = await Project.findById(project._id).populate("category");
    
    // Invalidate cache
    await invalidateCache();
    
    res.status(201).json(populatedProject);
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ message: "Error creating project" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, label, isHidden, links, existingMedia } = req.body;
    
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    let thumbnail = project.thumbnail;
    let media = [];
    
    if (existingMedia) {
      try {
        media = JSON.parse(existingMedia);
      } catch (e) {
        media = project.media;
      }
    } else {
        media = project.media;
    }

    if (req.files?.thumbnail?.[0]) {
      thumbnail = await uploadToR2(req.files.thumbnail[0], "thumbnails");
    }

    if (req.files?.images) {
      for (const file of req.files.images) {
        const url = await uploadToR2(file, "media/images");
        media.push({ type: "image", url, title: file.originalname });
      }
    }

    if (req.files?.video?.[0]) {
      const url = await uploadToR2(req.files.video[0], "media/videos");
      media.push({ type: "video", url, title: req.files.video[0].originalname });
    }

    if (req.files?.pdf?.[0]) {
      const url = await uploadToR2(req.files.pdf[0], "media/pdfs");
      media.push({ type: "pdf", url, title: req.files.pdf[0].originalname });
    }

    let parsedLinks = [];
    if (Array.isArray(links)) {
      parsedLinks = links.filter(l => l && l.trim() !== "");
    } else if (typeof links === "string") {
      try {
        parsedLinks = JSON.parse(links);
        if (!Array.isArray(parsedLinks)) parsedLinks = [parsedLinks];
      } catch (e) {
        parsedLinks = links.split(",").map(l => l.trim()).filter(l => l !== "");
      }
    } else {
        parsedLinks = project.links;
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category,
        label,
        isHidden: isHidden === "true" || isHidden === true,
        thumbnail,
        media,
        links: parsedLinks
      },
      { new: true }
    ).populate("category");

    // Invalidate cache
    await invalidateCache();

    res.json(updatedProject);
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ message: "Error updating project" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Invalidate cache
    await invalidateCache();
    
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project" });
  }
};

export const toggleVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { isHidden } = req.body;
    
    const project = await Project.findByIdAndUpdate(
      id,
      { isHidden },
      { new: true }
    ).populate("category");
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Invalidate cache
    await invalidateCache();
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error toggling visibility" });
  }
};
