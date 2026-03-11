import Category from "../models/Category.js";
import getRedisClient from "../config/redis.js";

const CACHE_KEY = "categories:all";
const CACHE_EXPIRATION = 3600; // 1 hour

const invalidateCategoryCache = async () => {
  try {
    const redis = getRedisClient();
    if (redis) await redis.del(CACHE_KEY);
  } catch (error) {
    console.warn("Redis category cache invalidation failed:", error.message);
  }
};

export const getCategories = async (req, res) => {
  try {
    const redis = getRedisClient();
    if (redis) {
      try {
        const cached = await redis.get(CACHE_KEY);
        if (cached) return res.json({ categories: JSON.parse(cached) });
      } catch (e) {
        console.warn("Redis GET categories failed:", e.message);
      }
    }

    const categories = await Category.find().sort({ createdAt: -1 });

    if (redis && categories.length > 0) {
      try {
        await redis.set(CACHE_KEY, JSON.stringify(categories), "EX", CACHE_EXPIRATION);
      } catch (e) {
        console.warn("Redis SET categories failed:", e.message);
      }
    }

    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category with this name already exists" });
    }
    const category = await Category.create({ name, description });
    await invalidateCategoryCache();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error creating category" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    await invalidateCategoryCache();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Error updating category" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    await invalidateCategoryCache();
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category" });
  }
};
