const ErrorResponse = require('../utils/errorResponse');
const LeaveBalance = require('../models/LeaveBalance');

// @desc    Get current user's leave balance
// @route   GET /api/balances/me
// @access  Private
exports.getMyBalance = async (req, res, next) => {
    try {
        const currentYear = new Date().getFullYear();
        const balance = await LeaveBalance.findOne({ user: req.user.id, year: currentYear });

        if (!balance) {
            return res.status(404).json({ success: false, error: 'Leave balance not active for this year' });
        }

        res.status(200).json({ success: true, data: balance });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all leave balances
// @route   GET /api/balances
// @access  Private (Admin)
exports.getBalances = async (req, res, next) => {
    try {
        const currentYear = new Date().getFullYear();
        const balances = await LeaveBalance.find({ year: currentYear }).populate({
            path: 'user',
            select: 'name email role'
        });

        res.status(200).json({ success: true, count: balances.length, data: balances });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Adjust leave balance manually
// @route   PUT /api/balances/:id
// @access  Private (Admin)
exports.adjustBalance = async (req, res, next) => {
    try {
        const { annualLeave, sickLeave, casualLeave, carriedForward } = req.body;

        let balance = await LeaveBalance.findById(req.params.id);

        if (!balance) {
            return res.status(404).json({ success: false, error: 'Leave balance not found' });
        }

        balance = await LeaveBalance.findByIdAndUpdate(
            req.params.id,
            { annualLeave, sickLeave, casualLeave, carriedForward },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: balance });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
