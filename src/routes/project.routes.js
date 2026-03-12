import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  toggleVisibility
} from "../controllers/project.controller.js";

const router = express.Router();

const cpUpload = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 10 },
  { name: 'pdf', maxCount: 10 }
]);

// public
router.get("/", getProjects);

// admin only
router.post("/", protect, cpUpload, createProject);
router.put("/:id", protect, cpUpload, updateProject);
router.patch("/:id/visibility", protect, toggleVisibility);
router.delete("/:id", protect, deleteProject);

export default router;
