import { Router } from "express";
import { forgotPassword, isUserLoggedIn, Login, logout, registerUsers, resetPassword } from "../controllers/userControllers.js";

const router = Router();

router.post('/register', registerUsers);
router.post('/login', Login);
router.post('/forgotPassword', forgotPassword);
router.post('/resetpassword/:token', resetPassword);
router.post('/logout', logout);
router.get('/isloggedin', isUserLoggedIn)

export default router