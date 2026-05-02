const mongoose = require('mongoose');

const ReimbursementSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expenseType: {
        type: String,
        required: [true, 'Please provide an expense type'],
        enum: ['Travel', 'Meals', 'Supplies', 'Training', 'Internet', 'Other']
    },
    amount: {
        type: Number,
        required: [true, 'Please provide the expense amount'],
        min: [1, 'Amount must be greater than 0']
    },
    expenseDate: {
        type: Date,
        required: [true, 'Please provide the date of the expense']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description of the expense']
    },
    receiptUrl: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['Pending', 'Manager Approved', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    // Delegation / Enterprise Admin Features
    approvedByRole: {
        type: String,
        enum: ['System', 'Manager', 'ActingManager', 'ActingAdmin', 'Admin']
    },
    approvedByActingAdmin: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    approvedByActingManager: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    needsManagerReview: {
        type: Boolean,
        default: false
    },
    managerReviewedAt: {
        type: Date
    },
    actingFor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    reviewedByManager: {
        type: Boolean,
        default: false
    },
    reviewedAction: {
        type: String,
        enum: ['ACCEPTED', 'OVERRIDDEN']
    },
    verifiedByAdmin: {
        type: Boolean,
        default: false
    },
    verifiedAt: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('Reimbursement', ReimbursementSchema);
