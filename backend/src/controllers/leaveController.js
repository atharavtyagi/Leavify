const ErrorResponse = require('../utils/errorResponse');
const Leave = require('../models/Leave');
const { sendLeaveAppliedEmail, sendLeaveStatusEmail } = require('../utils/emailService');

// @desc    Get all leaves (Admin/Manager see all, Employee sees own)
// @route   GET /api/leaves
// @access  Private
exports.getLeaves = async (req, res, next) => {
    try {
        const filter = {};

        if (req.query.startDate && req.query.endDate) {
            filter.$or = [
                { startDate: { $lte: new Date(req.query.endDate) }, endDate: { $gte: new Date(req.query.startDate) } }
            ];
        }

        if (req.user.role === 'Employee') {
            if (filter.$or) {
                filter.$and = [
                    { $or: filter.$or },
                    { $or: [{ employee: req.user.id }, { backupEmployee: req.user.id }] }
                ];
                delete filter.$or;
            } else {
                filter.$or = [{ employee: req.user.id }, { backupEmployee: req.user.id }];
            }
        }

        query = Leave.find(filter).populate({
            path: 'employee',
            select: 'name email role department'
        }).populate({
            path: 'backupEmployee',
            select: 'name email'
        });

        const leaves = await query;

        res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single leave
// @route   GET /api/leaves/:id
// @access  Private
exports.getLeave = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id).populate({
            path: 'employee',
            select: 'name email role'
        }).populate({
            path: 'backupEmployee',
            select: 'name email'
        });

        if (!leave) {
            return res.status(404).json({ success: false, error: 'Leave not found' });
        }

        // Ensure employee can only view their own leave
        if (leave.employee._id.toString() !== req.user.id && req.user.role === 'Employee') {
            return res.status(403).json({ success: false, error: 'Not authorized to view this leave' });
        }

        res.status(200).json({
            success: true,
            data: leave
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Employee, Manager)
exports.applyLeave = async (req, res, next) => {
    try {
        const { startDate, endDate, type, reason } = req.body;

        // Add user to req.body
        req.body.employee = req.user.id;

        // Ensure dates are valid
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ success: false, error: 'Start date cannot be after end date' });
        }

        const { calculateWorkingDays } = require('../utils/dateHelpers');
        const LeaveBalance = require('../models/LeaveBalance');

        const workingDays = calculateWorkingDays(startDate, endDate);
        if (workingDays <= 0) {
            return res.status(400).json({ success: false, error: 'Selected dates contain no working days' });
        }

        // Validate Balance
        const currentYear = new Date().getFullYear();
        const balance = await LeaveBalance.findOne({ user: req.user.id, year: currentYear });

        if (!balance) {
            return res.status(400).json({ success: false, error: 'Leave balance not active for this year.' });
        }

        // Map type to model field
        let typeField = '';
        if (type === 'Annual') typeField = 'annualLeave';
        else if (type === 'Sick') typeField = 'sickLeave';
        else if (type === 'Casual') typeField = 'casualLeave';

        if (balance[typeField] < workingDays) {
            return res.status(400).json({
                success: false,
                error: `Insufficient ${type} balance. You need ${workingDays} days, but only have ${balance[typeField]} left.`
            });
        }

        // Feature: Skill Risk Service
        const { calculateSkillRisk } = require('../services/skillRiskService');
        req.body = await calculateSkillRisk(req.body, req.user.id);

        const leave = await Leave.create(req.body);

        // Notify managers in the same department, or fallback to Admins
        const User = require('../models/User');
        const employee = await User.findById(req.user.id);
        let notifyUsers = await User.find({ role: 'Manager', department: employee.department });

        // Fallback: If no manager exists for this specific department, notify all Admins
        if (notifyUsers.length === 0) {
            notifyUsers = await User.find({ role: 'Admin' });
        }

        if (notifyUsers.length > 0) {
            sendLeaveAppliedEmail(notifyUsers, employee.name, leave);
        }

        res.status(201).json({
            success: true,
            data: leave
        });
    } catch (err) {
        console.error("Apply Leave Error:", err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'You already applied for leave on this date' });
        }
        res.status(500).json({ success: false, error: 'Server Error: ' + err.message });
    }
};

// @desc    Update leave status
// @route   PUT /api/leaves/:id
// @access  Private (Manager, Admin)
exports.updateLeaveStatus = async (req, res, next) => {
    const { calculateWorkingDays } = require('../utils/dateHelpers');
    const LeaveBalance = require('../models/LeaveBalance');

    try {
        let leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ success: false, error: 'Leave not found' });
        }

        const { status, managerComment } = req.body;

        // Make sure user is manager or admin
        if (req.user.role !== 'Manager' && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to update leave status' });
        }

        // Processing Approval and Deducting Balance
        if (status === 'Approved' && leave.status !== 'Approved') {
            const currentYear = new Date().getFullYear();
            const balance = await LeaveBalance.findOne({ user: leave.employee, year: currentYear });

            if (!balance) {
                return res.status(400).json({ success: false, error: 'Employee leave balance missing' });
            }

            // SMART LEAVE CONFLICT DETECTION
            const User = require('../models/User');
            const employeeUser = await User.findById(leave.employee);
            const department = employeeUser ? employeeUser.department : 'General';

            const overlappingLeaves = await Leave.find({
                status: 'Approved',
                _id: { $ne: leave._id },
                startDate: { $lte: leave.endDate },
                endDate: { $gte: leave.startDate }
            }).populate({ path: 'employee', select: 'department' });

            const sameDeptOverlaps = overlappingLeaves.filter(l => l.employee && l.employee.department === department);
            const limit = parseInt(process.env.DEPARTMENT_LEAVE_LIMIT) || 2;

            if (sameDeptOverlaps.length >= limit) {
                if (!req.body.conflictOverrideReason) {
                    return res.status(409).json({
                        success: false,
                        error: 'Conflict threshold exceeded for this department on these dates.',
                        requiresOverride: true
                    });
                } else {
                    const AuditLog = require('../models/AuditLog');
                    await AuditLog.create([{
                        action: 'LEAVE_CONFLICT_OVERRIDE',
                        user: req.user.id,
                        targetId: leave._id,
                        details: {
                            reason: req.body.conflictOverrideReason,
                            department,
                            overlappingCount: sameDeptOverlaps.length
                        }
                    }]);

                    leave.conflictOverrideReason = req.body.conflictOverrideReason;
                }
            }

            const workingDays = calculateWorkingDays(leave.startDate, leave.endDate);

            let typeField = '';
            if (leave.type === 'Annual') typeField = 'annualLeave';
            else if (leave.type === 'Sick') typeField = 'sickLeave';
            else if (leave.type === 'Casual') typeField = 'casualLeave';

            if (balance[typeField] < workingDays) {
                return res.status(400).json({ success: false, error: 'Employee has insufficient balance for approval' });
            }

            // Deduct
            balance[typeField] -= workingDays;
            await balance.save();
        }

        // Updating from Approved to something else (e.g. refunding) is not supported right now
        // A full implementation would increment the balance if it was previously approved

        leave.status = status;
        if (managerComment) leave.managerComment = managerComment;
        await leave.save();

        // Notify employee
        const User = require('../models/User');
        const employeeRecord = await User.findById(leave.employee);
        const managerRecord = await User.findById(req.user.id);
        sendLeaveStatusEmail(employeeRecord, managerRecord.name, leave, status, managerComment);

        res.status(200).json({
            success: true,
            data: leave
        });
    } catch (err) {
        console.error("updateLeaveStatus Error:", err);
        res.status(500).json({ success: false, error: 'Server Error: ' + err.message });
    }
};

// @desc    Delete leave
// @route   DELETE /api/leaves/:id
// @access  Private (Employee)
exports.deleteLeave = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ success: false, error: 'Leave not found' });
        }

        // Make sure user is leave owner
        if (leave.employee.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this leave' });
        }

        // Only allow deletion if pending
        if (leave.status !== 'Pending' && req.user.role !== 'Admin') {
            return res.status(400).json({ success: false, error: 'Cannot delete processed leave applications' });
        }

        await leave.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
