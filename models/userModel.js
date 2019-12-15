const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name.']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false // remove password from the output
    },
    passwordChangedAt: Date,
    likes: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

// Encrypt password before storing to database
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;
    next();
});

// Check if password has been modified
userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// Instance method - available for all collections
userSchema.methods.isPasswordMatched = async function(
    clientPassword,
    userPassword
) {
    return await bcrypt.compare(clientPassword, userPassword);
};

// Check if password changed after user try to login
userSchema.methods.changedPasswordAfter = function(loginTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return loginTimestamp < changedTimestamp;
    }

    return false;
};

// Check if password matched with encrypted password
userSchema.methods.correctPassword = async function(
    clientPassword,
    userPassword
) {
    return await bcrypt.compare(clientPassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
