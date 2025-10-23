import { Router } from "express";
import { forgotPassword, isUserLoggedIn, Login, logout, registerUsers, resetPassword } from "../controllers/userControllers.js";
import { routeProtect } from "../middleWare/routeProtect.js";

const router = Router();

router.post('/register', registerUsers);
router.post('/login', Login);
router.post('/forgotPassword', forgotPassword);

router.post('/resetpassword/:token', resetPassword);

router.post('/logout', logout);
router.get('/isloggedin', routeProtect, isUserLoggedIn);


export default router