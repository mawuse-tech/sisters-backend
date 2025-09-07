import { Router } from "express";
import { forgotPassword, Login, registerUsers, resetPassword } from "../controllers/userControllers.js";

const router = Router();

router.post('/register', registerUsers);
router.post('/login', Login);
router.post('/forgotPassword', forgotPassword);
router.post('/resetpassword/:token', resetPassword)

export default router