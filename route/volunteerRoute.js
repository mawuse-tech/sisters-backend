import { Router } from "express";
import { routeProtect } from "../middleWare/routeProtect.js";
import { fileUpload } from "../config/fileUpload.js";
import { deleteAvailableSlot, editProfile, fetchAllVolunteers, fetchPerPage, getVolunteerProfile, setAvailability, volunteerRegisterFuction } from "../controllers/volunteerController.js";

const router = Router()

router.post('/volunteer', routeProtect, fileUpload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'lincense', maxCount: 5 }
]), volunteerRegisterFuction)

router.post( '/updateProfile', routeProtect, fileUpload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'lincense', maxCount: 5 }
  ]),
  editProfile
);

router.post('/available', routeProtect, setAvailability)
router.delete('/deleteSlot/:slotId', routeProtect, deleteAvailableSlot)
router.get('/allVolunteer', fetchAllVolunteers)
router.get('/volunteer/:id',routeProtect, getVolunteerProfile)
router.get('/fourPerPage', routeProtect, fetchPerPage)

export default router