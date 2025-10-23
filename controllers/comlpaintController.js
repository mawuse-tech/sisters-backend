import { quitVolunteerLogic } from "../helpers/reusableFuctions.js";
import Complaint from "../models/complaint.js";


export const volunteerComplaint = async (req, res, next) => {
    const { reason } = req.body;
    try {
        const complaint = new Complaint({
            volunteerId: req.loggedInUser._id,
            reason: reason || null
        });

        await complaint.save()

        await quitVolunteerLogic(req.loggedInUser._id)

        res.status(201).json({
            success: true,
            message: reason ? "Complaint submitted and volunteer status removed."
                : "Volunteer status removed successfully.",
            quitInfo: complaint,
        });
    } catch (error) {
        next(error)
    }

}