import moment from "moment";
import User from "../models/users.js";

//quit volunteering logic
export const quitVolunteerLogic = async (volunteerId) => {

    const user = await User.findById(volunteerId).select("-password -passwordResetToken -passwordResetTokenEpiry -__v");

    if (!user) {
        throw new Error("User not found");
    }

    user.isVolunteer = false;
    user.profilePic = undefined; // clearing volunteer data from the database
    user.lincense = undefined;
    user.bio = undefined;
    user.proffession = undefined;
    user.linkedInLink = undefined;

    await user.save();

    return user

};

//time and day logic. reuseable function
export const timeLogic = (volunteers) => {
  const now = moment()
  const currentDay = now.format("dddd")
  const currentTime = now.format("HH:mm")

  // If input is a single volunteer not array, wrap it in an array
  const volunteerList = Array.isArray(volunteers) ? volunteers : [volunteers];

  const result = volunteerList.map((volunteer) => {
    let available = false

    for (let slot of volunteer.availability) {
      if (slot.day === currentDay) {
        if (currentTime >= slot.startTime && currentTime <= slot.endTime) {
          available = true;
          break;
        }
      }
    };

    return {
      ...volunteer.toObject(),
      isAvailable: available,
    };

  });

  return Array.isArray(volunteers) ? result : result[0];
}
