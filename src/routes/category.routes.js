import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../controllers/category.controller.js";

const router = express.Router();

// public
router.get("/", getCategories);

// admin only
router.post("/", protect, createCategory);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

export default router;
