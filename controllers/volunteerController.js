import User from "../models/users.js"
import moment from "moment";


export const volunteerRegisterFuction = async (req, res, next) => {
  try {
    const volunteer = await User.findById(req.loggedInUser._id).select("-password -passwordResetToken -passwordResetTokenEpiry -__v");


    if (!req.body.linkedInLink) {
      {
        const error = new Error('linkedIn Link is required')
        error.statusCode = 400
        return next(error)
      }
    };
    if (!req.body.proffession) {
      {
        const error = new Error('profession is required')
        error.statusCode = 400
        return next(error)
      }
    };
    if (!req.body.bio) {
      {
        const error = new Error('Bio is required')
        error.statusCode = 400
        return next(error)
      }
    };
    if (!req.files?.profilePic || req.files.profilePic.length === 0) {
      {
        const error = new Error('profile pic is required')
        error.statusCode = 400
        return next(error)
      }
    };
    if (!req.files?.lincense || req.files.lincense.length === 0) {
      {
        const error = new Error('Lincense is required')
        error.statusCode = 400
        return next(error)
      }
    }

    volunteer.linkedInLink = req.body.linkedInLink;
    volunteer.proffession = req.body.proffession;
    volunteer.bio = req.body.bio;

    if (req.files.profilePic) {
      volunteer.profilePic = `uploads/${req.files.profilePic[0].filename}`
    };

    if (req.files.lincense) {
      volunteer.lincense = req.files.lincense.map(file => `uploads/${file.filename}`);
    };

    volunteer.isVolunteer = true;

    await volunteer.save()

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Volunteer profile created successfully",
      volunteer

    })
  } catch (error) {
    console.log(error)
    next(error)
  }
};

//edit profile
export const editProfile = async (req, res, next) => {
  try {
    const findUser = await User.findById(req.loggedInUser._id).select("-password -passwordResetToken -passwordResetTokenEpiry -__v");


    findUser.firstName = req.body?.firstName || findUser.firstName;
    findUser.lastName = req.body?.lastName || findUser.lastName;
    findUser.email = req.body?.email || findUser.email;
    findUser.linkedInLink = req.body?.linkedInLink || findUser.linkedInLink;
    findUser.proffession = req.body?.proffession || findUser.proffession;
    findUser.bio = req.body?.bio || findUser.bio;

    if (req.files?.profilePic) {
      findUser.profilePic = `uploads/${req.files.profilePic[0].filename}`
    };

    if (req.files?.lincense) {
      findUser.lincense = req.files.lincense.map(file => `uploads/${file.filename}`);
    };

    findUser.isVolunteer = true;

    await findUser.save()
    // console.log("REQ BODY:", req.body);
    // console.log("REQ FILES:", req.files);


    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "profile updated successfully",
      user: findUser

    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

//quit volunteering
export const quitVolunteer = async (req, res, next) => {
  try {
    const user = await User.findById(req.loggedInUser._id).select("-password -passwordResetToken -passwordResetTokenEpiry -__v");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.isVolunteer = false;
    user.profilePic = undefined; // clearing volunteer data
    user.lincense = undefined;
    user.bio = undefined;
    user.proffession = undefined;
    user.linkedInLink = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "You have successfully quit volunteering",
      quitVolunteer: user
    });
  } catch (error) {
    next(error);
  }
};

//available 
export const setAvailability = async (req, res, next) => {
  try {
    const { day, startTime, endTime } = req.body;

    if (!day || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Day, start time, and end time are required",
      });
    }

    const user = await User.findById(req.loggedInUser._id).select("-password -passwordResetToken -passwordResetTokenEpiry -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.availability.push({ day, startTime, endTime });

    // user.isAvailable = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Availability saved successfully",
      availability: user
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

//deleting availability slot
export const deleteAvailableSlot = async (req, res, next) => {
  try {
    const volunteer = await User.findById(req.loggedInUser._id).select("-password -passwordResetToken -passwordResetTokenEpiry -__v");

    volunteer.availability.pull({ _id: req.params.slotId })
    await volunteer.save()

    res.json({
      success: true,
      message: "Slot deleted",
      availability: volunteer
    });
  } catch (error) {
    next(error)
  }
}

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


//fetching all volunteers
export const fetchAllVolunteers = async (req, res, next) => {
  try {
    const allVolunteers = await User.find({ isVolunteer: true }).select("-password -passwordResetToken -passwordResetTokenEpiry -__v");

    if (!allVolunteers.length) {
      return res.status(404).json({
        success: false,
        message: "No volunteer available for now, please try again later",
      });
    };

    const volunteerAvailableTimeLogic = timeLogic(allVolunteers) 

    res.status(200).json({
      success: true,
      message: "These are all volunteers",
      volunteers: volunteerAvailableTimeLogic,
    });
  } catch (error) {
    next(error)
  }
}

//fetching a volunteer profile
export const getVolunteerProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const volunteer = await User.findOne({ _id: id, isVolunteer: true })
      .select("-password -passwordResetToken -passwordResetTokenEpiry -__v");

    if (!volunteer) {
      return res.status(404).json({ success: false, message: "Volunteer not found" });
    }

    const volunteerProfile = timeLogic(volunteer)

    res.json({ 
      success: true, 
      volunteerProfile
    });
  } catch (error) {
    next(error);
  }
};


