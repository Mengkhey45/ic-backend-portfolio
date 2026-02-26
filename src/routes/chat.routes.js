import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import prisma from "../prisma/client.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

// Get all chat sessions (admin only)
router.get("/sessions", protect, async (req, res) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      include: {
        _count: {
          select: { messages: true }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return successResponse(res, sessions, "Chat sessions retrieved");
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

// Get messages for a specific session (admin only)
router.get("/sessions/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await prisma.message.findMany({
      where: { sessionId: id },
      orderBy: { createdAt: "asc" }
    });
    return successResponse(res, messages, "Messages retrieved");
  } catch (error) {
    return errorResponse(res, error.message);
  }
});

export default router;
