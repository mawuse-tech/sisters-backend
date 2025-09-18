import bcrypt from "bcryptjs";
import { model, Model, Schema } from "mongoose";
import crypto from 'crypto'

const userSchema = new Schema({
    firstName: {
        type: String,
        minlenght: 3,
        required: true
    },

    lastName: {
        type: String,
        minlenght: 3,
        required: true
    },

    email: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: function (value) {
                return value.includes('@')
            },
            message: ((props) => `${props.value} is not a valid email`)
        }
    },

    password: {
        type: String,
        minlength: 5,
        required: true,
    },

    // confirmPassword: {
    //     type: String,
    //     minlength: 5,
    //     required: true,

    //     validate: {
    //         validator: function (value) {
    //             return value === this.password
    //         },
    //         message: "password and confirm password should match"
    //     }
    // },

    role: {
        type: String,
        enum: ['user', 'sister'], //accepts array
        default: 'user'
    },

    linkedInLink: String,
    
    proffession: String,
    bio: {
        type: String,
        minlength: [50, "Bio must be at least 50 characters"],
        maxlength: [200, "Bio cannot exceed 200 characters"],
    },

    lincense: {
        type: [String]   //allows multiple files path 
    },
    profilePic: String,
    isVolunteer: { type: Boolean, default: false },

    passwordResetToken: String,
    passwordResetTokenEpiry: Date

});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined
    next()
});

userSchema.methods.comparePasswords = function (incomingPassword, exixtingPassword) {
    return bcrypt.compare(incomingPassword, exixtingPassword)
};

userSchema.methods.createResetPasswordToken = function () {
    const token = crypto.randomBytes(32)
    const resetToken = token.toString('hex')

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    this.passwordResetTokenEpiry = Date.now() + 24 * 60 * 60 * 1000

    return resetToken
}

const User = model('user', userSchema);

export default User
