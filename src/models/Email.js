const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true,
        unique: true
    },
    threadId: {
        type: String,
        required: true
    },
    googleId: {
        type: String,
        required: true,
        index: true
    },
    subject: {
        type: String,
        default: '(No Subject)'
    },
    sender: {
        name: String,
        email: String
    },
    receiver: {
        type: String
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    snippet: {
        type: String
    },
    body: {
        type: String
    },
    folder: {
        type: String,
        default: 'inbox',
        index: true
    },
    labels: {
        type: [String],
        default: []
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isStarred: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient searching and sorting
emailSchema.index({ googleId: 1, date: -1 });
emailSchema.index({ googleId: 1, folder: 1 });

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;
