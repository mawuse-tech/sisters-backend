import User from "../models/users.js"

export const volunteerRegisterFuction = async (req, res, next) => {
    try {
        const volunteer = await User.findById(req.loggedInUser._id)

        if (!req.body.linkedInLink) {
            {
                const error = new Error('linkedIn Link is required')
                error.statusCode = 400
                return next(error)
            }
        };
        if (!req.body.proffession) {
            {
                const error = new Error('proffession is required')
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
            
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
};

//edit profile
export const editProfile = async (req, res, next) => {
    try {
        const findUser = await User.findById(req.loggedInUser._id)

        findUser.firstName = req.body?.firstName || findUser.firstName;
        findUser.lastName = req.body?.lastName || findUser.lastName;
        findUser.email = req.body?.email || findUser.email;
        findUser.linkedInLink = req.body?.linkedInLink || findUser.linkedInLink;
        findUser.proffession = req.body?.proffession;
        findUser.bio = req.body?.bio;

        if (req.files?.profilePic) {
            findUser.profilePic = `uploads/${req.files.profilePic[0].filename}`
        };

        if (req.files?.lincense) {
            findUser.lincense = req.files.lincense.map(file => `uploads/${file.filename}`);
        };

        findUser.isVolunteer = true;

        await findUser.save()

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "profile updated successfully",
            // user: findUser

        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}