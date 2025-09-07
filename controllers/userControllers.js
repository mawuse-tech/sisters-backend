import User from "../models/users.js";
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";
import { sendMail } from "../config/email.js";
import crypto from 'crypto'


//register function
export const registerUsers = async (req, res, next) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName) {
        const error = new Error('First name is required')
        error.statusCode = 400
        return next(error)
    };
    if (!lastName) {
        const error = new Error('Last name is required')
        error.statusCode = 400
        return next(error)
    };
    if (!email) {
        const error = new Error('Email is required')
        error.statusCode = 400
        return next(error)
    };
    if (!password) {
        const error = new Error('Password is required')
        error.statusCode = 400
        return next(error)
    };
    if (!confirmPassword) {
        const error = new Error('confirm password is required')
        error.statusCode = 400
        return next(error)
    };

    if (password !== confirmPassword) {
        const error = new Error('password and confirm password must match')
        error.statusCode = 400
        return next(error)
    }

    try {
        const user = await User.create(req.body);

        const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            success: true,
            statusCode: 200,
            user,
        });

    } catch (error) {
        next(error)
    }
};


//login function
export const Login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email) {
        const error = new Error("email is required")
        error.statusCode = 400
        return next(error)
    }
    if (!password) {
        const error = new Error("Password is required")
        error.statusCode = 400
        return next(error)
    }

    try {
        const user = await User.findOne({ email })

        if (!user) {
            const error = new Error("Email or password is wrong")
            error.statusCode = 401
            return next(error)
        }

        const isMatch = await user.comparePasswords(password, user.password)
        if (!isMatch) {
            const error = new Error('incorect email or password')
            error.statusCode = 401
            return next(error)
        };

        const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });

        res.cookie('token', token, {
            httpOnly: true, //avoid client side tempering
            maxAge: 24 * 60 * 60 * 1000 //1 day
        })

        return res.status(200).json({
            success: true,
            statusCode: 200,
            user,
        })


    } catch (error) {

    }

};

//forgort password function
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            const error = new Error('please input your email')
            error.statusCode = 400
            return next(error)
        }
        const user = await User.findOne({ email })

        if (!user) {
            const error = new Error('could not find user with given email')
            error.statusCode = 404
            return next(error)
        };

        const resetToken = user.createResetPasswordToken()
        user.save({ validateBeforeSave: false });

        const resetPasswordLink = `${req.protocol}://localhost:5173/resetpassword/${resetToken}`
        const subject = 'there has been a password reset requset. follow the link provided'
        const html = `<p>This is the reset link:</p> <a href="${resetPasswordLink}" target="_blank">Follow link</a>`;


        try {
            sendMail({
                email: user.email,
                subject,
                html
            })

            res.status(200).json({
                success: true,
                message: 'link sent to your email'

            })
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            user.save({ validateBeforeSave: true })
            next(error)
        }

    } catch (error) {
        next(error)
    }

};

//reset password function
export const resetPassword = async (req, res, next) => {
    const { token } = req.params //grab the sent raw token coming from the user
    const encryptedToken = crypto.createHash('sha256').update(token).digest('hex')//hash the raw token again

    try {
        const user = await User.findOne({ passwordResetToken: encryptedToken, passwordResetTokenEpiry: { $gt: Date.now() } }); //compare the incoming hashed token to the one in the database 

        // if (!user) {
        //     const error = new Error('token has expired')
        //     error.statusCode = 400
        //     return next(error)
        // };

        //when everything is a succuss, we replae the incoming password with the db password;
        user.password = req.body.password
        user.confirmPassword = req.body.confirmPassword

        //we then remove these from the database
        user.passwordResetToken = undefined
        user.passwordResetTokenEpiry = undefined

        //we save all these back to the data base as an updated user data
        await user.save();

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'password reset successfully'
        })
    } catch (error) {
        next(error)
    }

}