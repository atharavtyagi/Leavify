const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: [true, 'Please select a leave type'],
        enum: ['Sick', 'Casual', 'Annual', 'Maternity', 'Paternity', 'Unpaid']
    },
    startDate: {
        type: Date,
        required: [true, 'Please select a start date']
    },
    endDate: {
        type: Date,
        required: [true, 'Please select an end date']
    },
    reason: {
        type: String,
        required: [true, 'Please provide a reason for the leave'],
        maxlength: [500, 'Reason can not be more than 500 characters']
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    managerComment: {
        type: String,
        maxlength: [500, 'Comment can not be more than 500 characters']
    },
    conflictOverrideReason: {
        type: String,
        maxlength: [500, 'Override reason can not be more than 500 characters']
    },
    appliedOn: {
        type: Date,
        default: Date.now
    },
    // Extensions
    backupEmployee: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    backupConfirmed: {
        type: Boolean,
        default: false
    },
    backupComment: {
        type: String,
        maxlength: [500, 'Comment can not be more than 500 characters']
    },
    backupConfirmedAt: {
        type: Date
    },
    skillRiskScore: {
        type: Number,
        default: 0
    },
    riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High']
    },
    criticalSkillsImpacted: {
        type: [String],
        default: []
    }
});

// Create a compound index so an employee can't apply for leave on the same exact start date
LeaveSchema.index({ employee: 1, startDate: 1 }, { unique: true });

module.exports = mongoose.model('Leave', LeaveSchema);
