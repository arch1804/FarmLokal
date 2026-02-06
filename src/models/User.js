const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        avatar: {
            type: String,
            default: null,
        },
        oauthProvider: {
            type: String,
            required: true,
            enum: ['google', 'github'],
        },
        oauthId: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        lastLogin: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.index({ oauthProvider: 1, oauthId: 1 }, { unique: true });
userSchema.index({ email: 1 });

userSchema.methods.updateLastLogin = function () {
    this.lastLogin = Date.now();
    return this.save();
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
