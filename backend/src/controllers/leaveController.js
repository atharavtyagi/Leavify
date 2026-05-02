const ErrorResponse = require('../utils/errorResponse');
const Leave = require('../models/Leave');
const { sendLeaveAppliedEmail, sendLeaveStatusEmail, sendLeaveFYIEmail } = require('../utils/emailService');
const auditLogger = require('../utils/auditLogger');
const { getDepartmentResponders } = require('../utils/managerResolver');

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
                    { $or: [{ employee: req.user.id }, { actingManager: req.user.id }] }
                ];
                delete filter.$or;
            } else {
                filter.$or = [{ employee: req.user.id }, { actingManager: req.user.id }];
            }
        } else if (req.user.role === 'Manager') {
            // Managers see all leaves in their scoped departments, EXCEPT their own
            const User = require('../models/User');
            const now = new Date();
            // Extremely robust 96-hour window (4 days) to handle any timezone shift
            const startOfWindow = new Date(now.getTime() - 48 * 60 * 60 * 1000);
            const endOfWindow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

            // Find any approved leaves where this user is the acting manager or backup
            const actingRoles = await Leave.find({
                $or: [{ actingManager: req.user.id }, { backupEmployee: req.user.id }],
                status: 'Approved',
                startDate: { $lte: endOfWindow },
                endDate: { $gte: startOfWindow }
            }).populate('employee', 'department');

            const delegatedDepts = actingRoles.map(l => l.employee?.department).filter(Boolean);
            const allAllowedDepts = [...new Set([req.user.department, ...delegatedDepts])];

            console.log(`[DEEP FIX] User ${req.user.name} covering depts:`, allAllowedDepts);

            const usersInDepts = await User.find({
                department: { $in: allAllowedDepts },
                _id: { $ne: req.user.id }
            }).select('_id name department');
            const userIds = usersInDepts.map(u => u._id);
            
            console.log(`[DEEP FIX] Found ${userIds.length} users in scoped depts.`);

            if (filter.$or) {
                filter.$and = [
                    { $or: filter.$or },
                    { $or: [{ employee: { $in: userIds } }, { actingManager: req.user.id }] }
                ];
                delete filter.$or;
            } else {
                filter.$or = [{ employee: { $in: userIds } }, { actingManager: req.user.id }];
            }
        }

        const query = Leave.find(filter).populate({
            path: 'employee',
            select: 'name email role department'
        }).populate({
            path: 'actingManager',
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
            path: 'actingManager',
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
        
        // Clean up delegation fields - ensure strings are trimmed or removed if empty
        if (req.body.actingManager && String(req.body.actingManager).trim() !== '') {
            req.body.actingManager = String(req.body.actingManager).trim();
        } else {
            delete req.body.actingManager;
        }

        if (req.body.actingAdminId && String(req.body.actingAdminId).trim() !== '') {
            req.body.actingAdminId = String(req.body.actingAdminId).trim();
        } else {
            delete req.body.actingAdminId;
        }

        if (req.body.backupEmployee && String(req.body.backupEmployee).trim() !== '') {
            req.body.backupEmployee = String(req.body.backupEmployee).trim();
        } else {
            delete req.body.backupEmployee;
        }
        
        if (req.user.role === 'Admin') {
            const AdminLeaveService = require('../services/adminLeaveService');
            const io = req.app.get('io');
            const leave = await AdminLeaveService.processAdminLeave(req.body, req.user, io);
            return res.status(201).json({
                success: true,
                data: leave
            });
        }

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

        // Fetch full employee details for notifications
        const employee = await User.findById(req.user.id);
        
        // Notify responders (Primary vs FYI)
        const { primary, fyi } = await getDepartmentResponders(employee.department);
        
        if (primary.length > 0) {
            sendLeaveAppliedEmail(primary, employee.name, leave);
        }
        if (fyi.length > 0) {
            sendLeaveFYIEmail(fyi, employee.name, leave);
        }

        res.status(201).json({
            success: true,
            data: leave
        });

        await auditLogger({
            action: 'LEAVE_APPLIED',
            performedBy: req.user.id,
            role: req.user.role,
            metadata: {
                leaveId: leave._id,
                type: leave.type,
                startDate: leave.startDate,
                endDate: leave.endDate,
                isCritical: leave.isCriticalAtApplication,
                actingManager: leave.actingManager
            }
        });

        if (leave.actingManager) {
            await auditLogger({
                action: 'ACTING_MANAGER_ASSIGNED',
                performedBy: req.user.id,
                role: req.user.role,
                targetUser: leave.actingManager,
                metadata: {
                    leaveId: leave._id,
                    department: employee.department
                }
            });
        }
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

        let approverRole = req.user.role;
        if (req.isActingAdmin) {
            approverRole = 'ActingAdmin';
        }

        // Make sure user is manager, admin, or Acting Admin
        if (req.user.role !== 'Manager' && req.user.role !== 'Admin' && !req.isActingAdmin) {
            return res.status(403).json({ success: false, error: 'Not authorized to update leave status' });
        }

        // [NEW] Block approvals if Manager is on leave (View-Only)
        if (req.viewOnlyStatus && !req.isActingAdmin) {
            return res.status(403).json({ 
                success: false, 
                error: 'Your account is in View-Only mode while you are on leave. Please contact your Acting Manager for approvals.' 
            });
        }

        // Wait to fetch employee to see if Manager is acting for them
        const User = require('../models/User');
        const employeeUser = await User.findById(leave.employee);
        const department = employeeUser ? employeeUser.department : 'General';
        
        let isApprovalByActingManager = false;
        if (req.user.role === 'Manager' && !req.isActingAdmin) {
            if (department !== req.user.department) {
                if (req.isActingManager && req.actingManagerDepts && req.actingManagerDepts.includes(department)) {
                    isApprovalByActingManager = true;
                } else if (req.user.department !== 'HR') {
                    return res.status(403).json({ success: false, error: 'Not authorized to approve this department\'s requests' });
                }
            }
        }

        // Processing Approval and Deducting Balance
        if (status === 'Approved' && leave.status !== 'Approved') {
            const currentYear = new Date().getFullYear();
            const balance = await LeaveBalance.findOne({ user: leave.employee, year: currentYear });

            if (!balance) {
                return res.status(400).json({ success: false, error: 'Employee leave balance missing' });
            }

            // We already fetched employeeUser and department


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

        // Trace acting admin approvals
        if (approverRole === 'ActingAdmin') {
            leave.approvedByRole = 'ActingAdmin';
            leave.approvedByActingAdmin = req.user.id;
        } else if (isApprovalByActingManager) {
            leave.approvedByRole = 'ActingManager';
            leave.approvedByActingManager = req.user.id;
            leave.needsManagerReview = true;
            // Set who the acting manager is acting for
            if (req.actingManagerDelegations && employeeRecord.department) {
                leave.actingFor = req.actingManagerDelegations[employeeRecord.department];
            }
        } else if (approverRole === 'Manager' || approverRole === 'Admin') {
            leave.approvedByRole = approverRole;
        }

        await leave.save();

        // Emit automated Chat System Message
        const { addSystemMessage } = require('./chatController');
        const io = req.app.get('io');
        let messageText = `Leave request marked as **${status}** by ${req.user.name}.`;
        if (managerComment) messageText += `\n*Reason: ${managerComment}*`;
        await addSystemMessage('leave', leave._id, messageText, req.user.id, io);

        // Notify employee
        const employeeRecord = await User.findById(leave.employee);
        const managerRecord = await User.findById(req.user.id);
        sendLeaveStatusEmail(employeeRecord, managerRecord.name, leave, status, managerComment);

        res.status(200).json({
            success: true,
            data: leave
        });

        await auditLogger({
            action: status === 'Approved' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
            performedBy: req.user.id,
            role: approverRole,
            targetUser: leave.employee,
            metadata: {
                leaveId: leave._id,
                managerComment
            }
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

// @desc    Review acting manager approval
// @route   POST /api/leaves/:id/review
// @access  Private (Manager)
exports.reviewActingManagerLeave = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id).populate('employee');

        if (!leave) {
            return res.status(404).json({ success: false, error: 'Leave not found' });
        }

        if (req.user.role !== 'Manager' && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to review this leave' });
        }

        if (req.user.role === 'Manager' && leave.employee.department !== req.user.department) {
             return res.status(403).json({ success: false, error: 'Not authorized to review this department\'s requests' });
        }

        if (!leave.needsManagerReview) {
             return res.status(400).json({ success: false, error: 'This leave does not require manager review' });
        }

        leave.needsManagerReview = false;
        leave.managerReviewedAt = Date.now();
        await leave.save();

        res.status(200).json({
            success: true,
            data: leave
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
