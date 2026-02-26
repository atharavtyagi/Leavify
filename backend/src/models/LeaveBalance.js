const mongoose = require('mongoose');

const LeaveBalanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    year: {
        type: Number,
        required: true,
        default: new Date().getFullYear()
    },
    annualLeave: {
        type: Number,
        default: 0,
        max: [21, 'Cannot exceed yearly cap of 21 days']
    },
    sickLeave: {
        type: Number,
        default: 14 // Assuming 14 days granted at start of year
    },
    casualLeave: {
        type: Number,
        default: 14 // Assuming 14 days granted at start of year
    },
    carriedForward: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LeaveBalance', LeaveBalanceSchema);
