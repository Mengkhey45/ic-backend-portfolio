import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createShareLink,
  getShareLinks,
  deleteShareLink
} from "../controllers/share.controller.js";

const router = express.Router();

router.post("/", protect, createShareLink);
router.get("/", protect, getShareLinks);
router.delete("/:id", protect, deleteShareLink);

export default router;
