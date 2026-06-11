import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
    sendMessage,
    getMessages
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/:chatId/messages", protect, sendMessage);
router.get("/:chatId/messages", protect, getMessages);

export default router;