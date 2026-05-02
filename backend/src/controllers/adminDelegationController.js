const Leave = require('../models/Leave');
const Reimbursement = require('../models/Reimbursement');
const User = require('../models/User');

// @desc    Get all Managers for acting admin select dropdown
// @route   GET /api/admin/delegation/managers
// @access  Private (Admin)
exports.getManagers = async (req, res) => {
    try {
        const managers = await User.find({ role: 'Manager' }).select('name email department');
        res.status(200).json({ success: true, data: managers });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Check if currently logged in manager is an acting admin
// @route   GET /api/admin/delegation/status
// @access  Private (Manager)
exports.checkActingAdminStatus = async (req, res) => {
    try {
        if (req.isActingAdmin && req.activeDelegation) {
            return res.status(200).json({
                success: true,
                isActingAdmin: true,
                endDate: req.activeDelegation.actingEndDate
            });
        }
        return res.status(200).json({ success: true, isActingAdmin: false });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all pending reviews for a returned admin
// @route   GET /api/admin/delegation/review
// @access  Private (Admin)
exports.getReviewPending = async (req, res) => {
    try {
        const leaves = await Leave.find({ approvedByRole: 'ActingAdmin', verifiedByAdmin: false })
            .populate('employee', 'name email department')
            .populate('approvedByActingAdmin', 'name');
            
        const reimbursements = await Reimbursement.find({ approvedByRole: 'ActingAdmin', verifiedByAdmin: false })
            .populate('employee', 'name email department')
            .populate('approvedByActingAdmin', 'name');
            
        res.status(200).json({ success: true, data: { leaves, reimbursements } });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Mark an acting admin action as verified
// @route   PATCH /api/admin/delegation/verify/:type/:id
// @access  Private (Admin)
exports.verifyDelegationAction = async (req, res) => {
    try {
        const { type, id } = req.params;
        let record;

        if (type === 'leave') {
            record = await Leave.findById(id);
        } else if (type === 'reimbursement') {
            record = await Reimbursement.findById(id);
        } else {
            return res.status(400).json({ success: false, error: 'Invalid type' });
        }

        if (!record) {
            return res.status(404).json({ success: false, error: 'Record not found' });
        }

        record.verifiedByAdmin = true;
        record.verifiedAt = Date.now();
        await record.save();

        res.status(200).json({ success: true, data: record });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
