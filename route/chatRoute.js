import { Router } from "express";
import { getChatPartners, getMessages, getRecentChats, sendMessage } from "../controllers/chatController.js";

const router = Router()
router.get('/recentChat/:adminId', getRecentChats)
router.get("/partners/:userId", getChatPartners)
router.post('/', sendMessage)
router.get("/:senderId/:receiverId", getMessages);


export default router