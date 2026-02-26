const Reimbursement = require('../models/Reimbursement');
const User = require('../models/User');

// @desc    Apply for reimbursement
// @route   POST /api/reimbursements/apply
// @access  Private (Employee)
exports.applyReimbursement = async (req, res) => {
    try {
        const { expenseType, amount, expenseDate, description } = req.body;
        let receiptUrl = req.body.receiptUrl || '';

        // If a file was uploaded, use its static path instead
        if (req.file) {
            receiptUrl = `/uploads/receipts/${req.file.filename}`;
        }

        if (amount <= 0) {
            return res.status(400).json({ success: false, error: 'Amount must be greater than 0' });
        }

        const reimbursement = await Reimbursement.create({
            employee: req.user.id,
            expenseType,
            amount,
            expenseDate,
            description,
            receiptUrl
        });

        res.status(201).json({
            success: true,
            data: reimbursement
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error', details: error.message });
    }
};

// @desc    Get logged in employee's reimbursements
// @route   GET /api/reimbursements/my
// @access  Private (Employee)
exports.getMyReimbursements = async (req, res) => {
    try {
        const reimbursements = await Reimbursement.find({ employee: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reimbursements.length,
            data: reimbursements
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all reimbursements (for Manager/Admin)
// @route   GET /api/reimbursements/all
// @access  Private (Manager, Admin)
exports.getAllReimbursements = async (req, res) => {
    try {
        let query = Reimbursement.find().populate('employee', 'name email department role');

        // Managers only see their department
        if (req.user.role === 'Manager') {
            const usersInDept = await User.find({ department: req.user.department }).select('_id');
            const userIds = usersInDept.map(u => u._id);
            query = query.where('employee').in(userIds);
        }

        const reimbursements = await query.sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reimbursements.length,
            data: reimbursements
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Approve reimbursement
// @route   PATCH /api/reimbursements/:id/approve
// @access  Private (Manager, Admin)
exports.approveReimbursement = async (req, res) => {
    try {
        const reimbursement = await Reimbursement.findById(req.params.id).populate('employee', 'department');

        if (!reimbursement) {
            return res.status(404).json({ success: false, error: 'Reimbursement request not found' });
        }

        if (reimbursement.status === 'Approved' || reimbursement.status === 'Rejected') {
            return res.status(400).json({ success: false, error: `Cannot approve request that is already ${reimbursement.status}` });
        }

        if (req.user.role === 'Manager' && reimbursement.employee.department !== req.user.department && req.user.department !== 'HR') {
            return res.status(403).json({ success: false, error: 'Not authorized to approve this department\'s requests' });
        }

        if (req.user.role === 'Manager') {
            if (reimbursement.status !== 'Pending') {
                return res.status(400).json({ success: false, error: 'Managers can only approve Pending requests' });
            }
            reimbursement.status = 'Manager Approved';
        } else if (req.user.role === 'Admin') {
            reimbursement.status = 'Approved';
        }

        reimbursement.reviewedBy = req.user.id;
        reimbursement.reviewedAt = Date.now();
        await reimbursement.save();

        res.status(200).json({
            success: true,
            data: reimbursement
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Reject reimbursement
// @route   PATCH /api/reimbursements/:id/reject
// @access  Private (Manager, Admin)
exports.rejectReimbursement = async (req, res) => {
    try {
        const reimbursement = await Reimbursement.findById(req.params.id).populate('employee', 'department');

        if (!reimbursement) {
            return res.status(404).json({ success: false, error: 'Reimbursement request not found' });
        }

        if (reimbursement.status === 'Approved' || reimbursement.status === 'Rejected') {
            return res.status(400).json({ success: false, error: `Cannot reject request that is already ${reimbursement.status}` });
        }

        if (req.user.role === 'Manager' && reimbursement.employee.department !== req.user.department && req.user.department !== 'HR') {
            return res.status(403).json({ success: false, error: 'Not authorized to reject this department\'s requests' });
        }

        if (req.user.role === 'Manager' && reimbursement.status !== 'Pending') {
            return res.status(400).json({ success: false, error: 'Managers can only reject Pending requests' });
        }

        reimbursement.status = 'Rejected';
        reimbursement.reviewedBy = req.user.id;
        reimbursement.reviewedAt = Date.now();
        await reimbursement.save();

        res.status(200).json({
            success: true,
            data: reimbursement
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete reimbursement
// @route   DELETE /api/reimbursements/:id
// @access  Private (Admin)
exports.deleteReimbursement = async (req, res) => {
    try {
        const reimbursement = await Reimbursement.findById(req.params.id);

        if (!reimbursement) {
            return res.status(404).json({ success: false, error: 'Reimbursement request not found' });
        }

        await reimbursement.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
