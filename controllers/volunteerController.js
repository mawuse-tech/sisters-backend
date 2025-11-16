import { timeLogic } from "../helpers/reusableFuctions.js";
import User from "../models/users.js"


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

    // if (req.files.profilePic) {
    //   volunteer.profilePic = `uploads/${req.files.profilePic[0].filename}`
    // };

    // if (req.files.lincense) {
    //   volunteer.lincense = req.files.lincense.map(file => `uploads/${file.filename}`);
    // };
    if (req.files.profilePic) {
      volunteer.profilePic = req.files.profilePic[0].path;  // Cloudinary URL
    }

    if (req.files.lincense) {
      volunteer.lincense = req.files.lincense.map(file => file.path); // Array of Cloudinary URLs
    }

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
      findUser.profilePic = req.files.profilePic[0].path
    };

    if (req.files?.lincense) {
      findUser.lincense = req.files.lincense.map(file => file.path);
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

    // const volunteerAvailableTimeLogic = timeLogic(allVolunteers)

    res.status(200).json({
      success: true,
      message: "These are all volunteers",
      volunteers: allVolunteers,
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

//query 
export const fetchPerPage = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;
    const { proffession, available, search } = req.query;

    const filter = { isVolunteer: true };

    if (proffession) {
      filter.proffession = proffession;
    }

    if (search) {
      const regex = { $regex: search, $options: "i" };
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { proffession: regex }
      ];
    }


    // Query using the filter
    const [volunteers, totalVolunteers] = await Promise.all([
      User.find(filter)
        .select("-password -passwordResetToken -passwordResetTokenEpiry -__v")
        .limit(limit)
        .skip(skip),
      User.countDocuments(filter),
    ]);

    let volunteerAvailableTimeLogic = timeLogic(volunteers);

    //after volunteers have gone through the time logic, now we can access the available 
    if (available === "true") {
      volunteerAvailableTimeLogic = volunteerAvailableTimeLogic.filter(v => v.isAvailable);
    }

    res.status(200).json({
      success: true,
      volunteers: volunteerAvailableTimeLogic,
      page,
      totalVolunteers,
      pages: Math.ceil(totalVolunteers / limit),
    });
  } catch (error) {
    next(error);
  }
};
