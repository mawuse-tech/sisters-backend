import { Router } from "express";
import { routeProtect } from "../middleWare/routeProtect.js";
import { volunteerComplaint } from "../controllers/comlpaintController.js";

const router = Router()

// router.post('/quit', routeProtect, quitVolunteer)
router.post('/complaint', routeProtect, volunteerComplaint)

export default router