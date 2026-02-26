import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject
} from "../controllers/project.controller.js";

const router = express.Router();

// public
router.get("/", getProjects);

// admin only
router.post("/", protect, upload.single("image"), createProject);
router.put("/:id", protect, upload.single("image"), updateProject);
router.delete("/:id", protect, deleteProject);

export default router;