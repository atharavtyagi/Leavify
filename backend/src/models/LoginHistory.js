const mongoose = require('mongoose');

const LoginHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    device: {
        type: String,
        required: true
    },
    location: {
        type: String
    },
    loginTime: {
        type: Date,
        default: Date.now,
        required: true,
        index: true
    },
    logoutTime: {
        type: Date
    }
});

module.exports = mongoose.model('LoginHistory', LoginHistorySchema);
