import express from "express";
import { getPublicPortfolio } from "../controllers/portfolio.controller.js";

const router = express.Router();

router.get("/", getPublicPortfolio);

export default router;
