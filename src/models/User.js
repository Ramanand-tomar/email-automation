const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    profileImage: {
        type: String,
        default: ''
    },
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
    lastHistoryId: {
        type: String,
        default: null
    },
    watchExpiration: {
        type: Date,
        default: null
    },
    syncPeriod: {
        type: String,
        enum: ['7', '30', '90', 'everything'],
        default: '30'
    },
    inboxCategories: {
        type: [String],
        default: ['primary']
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
