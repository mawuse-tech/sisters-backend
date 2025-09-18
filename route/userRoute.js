import { Router } from "express";
import { forgotPassword, isUserLoggedIn, Login, logout, registerUsers, resetPassword } from "../controllers/userControllers.js";
import { routeProtect } from "../middleWare/routeProtect.js";
import { fileUpload } from "../config/fileUpload.js";
import { editProfile, volunteerRegisterFuction } from "../controllers/volunteerController.js";

const router = Router();

router.post('/register', registerUsers);
router.post('/login', Login);
router.post('/forgotPassword', forgotPassword);
router.post('/resetpassword/:token', resetPassword);
router.post('/logout', logout);
router.get('/isloggedin', isUserLoggedIn);
router.post('/volunteer', routeProtect, fileUpload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'lincense', maxCount: 5 }
]), volunteerRegisterFuction)
router.post('/updateProfile', routeProtect, editProfile)

export default router