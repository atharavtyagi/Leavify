const Reimbursement = require('../models/Reimbursement');
const User = require('../models/User');
const auditLogger = require('../utils/auditLogger');
const { 
    sendReimbursementAppliedEmail, 
    sendReimbursementFYIEmail, 
    sendReimbursementToFinanceEmail,
    sendReimbursementStatusEmail 
} = require('../utils/emailService');
const { getDepartmentResponders } = require('../utils/managerResolver');

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

        await auditLogger({
            action: 'REIMBURSEMENT_SUBMITTED',
            performedBy: req.user.id,
            role: req.user.role,
            metadata: {
                reimbursementId: reimbursement._id,
                amount: reimbursement.amount,
                expenseType: reimbursement.expenseType
            }
        });

        const employee = await User.findById(req.user.id);
        const { primary, fyi } = await getDepartmentResponders(employee.department);

        if (primary.length > 0) {
            sendReimbursementAppliedEmail(primary, employee.name, reimbursement);
        }
        if (fyi.length > 0) {
            sendReimbursementFYIEmail(fyi, employee.name, reimbursement);
        }

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

        // Managers see their department AND excluding their own personal claims (unless Acting Admin) + Acting Manager covered departments
        if (req.user.role === 'Manager' && !req.isActingAdmin) {
            const allowedDepts = [req.user.department];
            if (req.isActingManager && req.actingManagerDepts) {
                allowedDepts.push(...req.actingManagerDepts);
            }
            console.log(`[REIMBURSEMENT DEBUG] Scoping reimbursements for ${req.user.name}. Allowed Depts: ${allowedDepts.join(', ')}`);

            const usersInDept = await User.find({
                department: { $in: allowedDepts },
                _id: { $ne: req.user.id } // NEVER load the manager's own claims into the approval queue
            }).select('_id');

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

        let approverRole = req.user.role;
        if (req.isActingAdmin) {
            approverRole = 'ActingAdmin';
        }

        let isApprovalByActingManager = false;
        if (req.user.role === 'Manager' && !req.isActingAdmin) {
            if (reimbursement.employee.department !== req.user.department) {
                if (req.isActingManager && req.actingManagerDepts && req.actingManagerDepts.includes(reimbursement.employee.department)) {
                    isApprovalByActingManager = true;
                } else if (req.user.department !== 'HR') {
                    return res.status(403).json({ success: false, error: 'Not authorized to approve this department\'s requests' });
                }
            }
        }

        // [NEW] Block approvals if Manager is on leave (View-Only)
        if (req.viewOnlyStatus && !req.isActingAdmin) {
            return res.status(403).json({ 
                success: false, 
                error: 'Your account is in View-Only mode while you are on leave. Please contact your Acting Manager for approvals.' 
            });
        }

        if (req.user.role === 'Manager' && !req.isActingAdmin) {
            if (reimbursement.status !== 'Pending') {
                return res.status(400).json({ success: false, error: 'Managers can only approve Pending requests' });
            }
            reimbursement.status = 'Manager Approved';
        } else if (req.user.role === 'Admin' || req.isActingAdmin) {
            reimbursement.status = 'Approved';
        }

        reimbursement.reviewedBy = req.user.id;
        reimbursement.reviewedAt = Date.now();
        
        if (approverRole === 'ActingAdmin') {
            reimbursement.approvedByRole = 'ActingAdmin';
            reimbursement.approvedByActingAdmin = req.user.id;
        } else if (isApprovalByActingManager) {
            reimbursement.approvedByRole = 'ActingManager';
            reimbursement.approvedByActingManager = req.user.id;
            reimbursement.needsManagerReview = true;
            // Set who the acting manager is acting for
            if (req.actingManagerDelegations && reimbursement.employee.department) {
                reimbursement.actingFor = req.actingManagerDelegations[reimbursement.employee.department];
            }
        } else {
            reimbursement.approvedByRole = approverRole;
        }

        await reimbursement.save();

        await auditLogger({
            action: approverRole === 'Admin' || approverRole === 'ActingAdmin' ? 'REIMBURSEMENT_APPROVED' : 'REIMBURSEMENT_MANAGER_APPROVED',
            performedBy: req.user.id,
            role: approverRole,
            targetUser: reimbursement.employee._id,
            metadata: {
                reimbursementId: reimbursement._id,
                amount: reimbursement.amount
            }
        });

        // Emit automated Chat System Message
        const { addSystemMessage } = require('./chatController');
        const io = req.app.get('io');
        let messageText = `Reimbursement request marked as **${reimbursement.status}** by ${req.user.name}.`;
        await addSystemMessage('reimbursement', reimbursement._id, messageText, req.user.id, io);

        // Notify Finance/Admin after Manager Approval
        if (reimbursement.status === 'Manager Approved' || reimbursement.status === 'Approved') {
            const admins = await User.find({ role: 'Admin' });
            sendReimbursementToFinanceEmail(admins, employee.name, reimbursement);
        }

        // Notify Employee of status change
        sendReimbursementStatusEmail(employee, reimbursement.status, reimbursement);

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

        let approverRole = req.user.role;
        if (req.isActingAdmin) {
            approverRole = 'ActingAdmin';
        }

        let isApprovalByActingManager = false;
        if (req.user.role === 'Manager' && !req.isActingAdmin) {
            if (reimbursement.employee.department !== req.user.department) {
                if (req.isActingManager && req.actingManagerDepts && req.actingManagerDepts.includes(reimbursement.employee.department)) {
                    isApprovalByActingManager = true;
                } else if (req.user.department !== 'HR') {
                    return res.status(403).json({ success: false, error: 'Not authorized to reject this department\'s requests' });
                }
            }
        }

        // [NEW] Block if Manager is on leave
        if (req.viewOnlyStatus && !req.isActingAdmin) {
            return res.status(403).json({ 
                success: false, 
                error: 'Your account is in View-Only mode while you are on leave.' 
            });
        }

        if (req.user.role === 'Manager' && !req.isActingAdmin && reimbursement.status !== 'Pending') {
            return res.status(400).json({ success: false, error: 'Managers can only reject Pending requests' });
        }

        reimbursement.status = 'Rejected';
        reimbursement.reviewedBy = req.user.id;
        reimbursement.reviewedAt = Date.now();

        if (approverRole === 'ActingAdmin') {
            reimbursement.approvedByRole = 'ActingAdmin';
            reimbursement.approvedByActingAdmin = req.user.id;
        } else if (isApprovalByActingManager) {
            reimbursement.approvedByRole = 'ActingManager';
            reimbursement.approvedByActingManager = req.user.id;
            reimbursement.needsManagerReview = true;
        } else {
            reimbursement.approvedByRole = approverRole;
        }

        await reimbursement.save();

        await auditLogger({
            action: 'REIMBURSEMENT_REJECTED',
            performedBy: req.user.id,
            role: approverRole,
            targetUser: reimbursement.employee._id,
            metadata: {
                reimbursementId: reimbursement._id
            }
        });

        // Emit automated Chat System Message
        const { addSystemMessage } = require('./chatController');
        const io = req.app.get('io');
        let messageText = `Reimbursement request marked as **Rejected** by ${req.user.name}.`;
        await addSystemMessage('reimbursement', reimbursement._id, messageText, req.user.id, io);

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

// @desc    Review acting manager reimbursement approval
// @route   POST /api/reimbursements/:id/review
// @access  Private (Manager)
exports.reviewActingManagerReimbursement = async (req, res, next) => {
    try {
        const reimbursement = await Reimbursement.findById(req.params.id).populate('employee');

        if (!reimbursement) {
            return res.status(404).json({ success: false, error: 'Reimbursement not found' });
        }

        if (req.user.role !== 'Manager' && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to review this reimbursement' });
        }

        if (req.user.role === 'Manager' && reimbursement.employee.department !== req.user.department) {
             return res.status(403).json({ success: false, error: 'Not authorized to review this department\'s requests' });
        }

        if (!reimbursement.needsManagerReview) {
             return res.status(400).json({ success: false, error: 'This reimbursement does not require manager review' });
        }

        reimbursement.needsManagerReview = false;
        reimbursement.managerReviewedAt = Date.now();
        await reimbursement.save();

        res.status(200).json({
            success: true,
            data: reimbursement
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
