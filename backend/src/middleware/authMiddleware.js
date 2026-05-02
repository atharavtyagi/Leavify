const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ success: false, error: 'User no longer exists' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

// [NEW] Middleware to enrich request with delegation/leave context
exports.checkDelegation = async (req, res, next) => {
    if (!req.user) return next();
    
    // TRACE LOG
    console.log(`[DELEGATION TRACE] Checking delegation for user: ${req.user.name} (Role: ${req.user.role})`);

    const role = String(req.user.role || '').toLowerCase();
    
    if (role === 'manager' || role === 'admin') {
        const Leave = require('../models/Leave');
        const now = new Date();
        // 72-hour centered window for timezone robustness (IST/UTC shift)
        const startOfWindow = new Date(now.getTime() - 36 * 60 * 60 * 1000);
        const endOfWindow = new Date(now.getTime() + 36 * 60 * 60 * 1000);

        // 1. Acting Admin Check
        if (role === 'manager') {
            const activeDelegation = await Leave.findOne({
                actingAdminId: req.user.id,
                actingAdminActive: true,
                actingStartDate: { $lte: endOfWindow },
                actingEndDate: { $gte: startOfWindow },
                status: 'Approved'
            });
            if (activeDelegation) {
                req.isActingAdmin = true;
                req.activeDelegation = activeDelegation;
                console.log(`[DELEGATION TRACE] ${req.user.name} is Acting Admin`);
            }
        }

        // 2. Acting Manager Check (Departments they are covering)
        // Check both ObjectId and String versions of ID just in case
        const activeActingRoles = await Leave.find({
            $or: [
                { actingManager: req.user.id },
                { backupEmployee: req.user.id }
            ],
            status: 'Approved',
            startDate: { $lte: endOfWindow },
            endDate: { $gte: startOfWindow }
        }).populate('employee', 'name department role');

        console.log(`[DELEGATION TRACE] Found ${activeActingRoles.length} acting roles for ${req.user.name}`);

        const actingDepts = [];
        const actingDelegations = {};
        for (const leave of activeActingRoles) {
            if (leave.employee && leave.employee.department) {
                const empRole = String(leave.employee.role || '').toLowerCase();
                if (empRole === 'manager' || empRole === 'admin') {
                    actingDepts.push(leave.employee.department);
                    actingDelegations[leave.employee.department] = leave.employee._id;
                    console.log(`[DELEGATION TRACE] REDIRECTION: ${req.user.name} covers ${leave.employee.name} in ${leave.employee.department}`);
                }
            }
        }

        if (actingDepts.length > 0) {
            req.isActingManager = true;
            req.actingManagerDepts = [...new Set(actingDepts)];
            req.actingManagerDelegations = actingDelegations;
            console.log(`[DELEGATION TRACE] Final acting depts:`, req.actingManagerDepts);
        }

        // 3. View-Only Status Check (Manager on Leave)
        const personalLeave = await Leave.findOne({
            employee: req.user.id,
            status: 'Approved',
            startDate: { $lte: endOfWindow },
            endDate: { $gte: startOfWindow }
        });

        if (personalLeave) {
            req.isCurrentlyOnLeave = true;
            req.viewOnlyStatus = true;
            req.activePersonalLeave = personalLeave;
            console.log(`[DELEGATION TRACE] ${req.user.name} is CURRENTLY ON LEAVE (View-Only)`);
        }
    }
    
    req.delegationChecked = true;
    next();
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return async (req, res, next) => {
        // Run checkDelegation logic if not already run
        if (!req.delegationChecked) {
            // We need to wait for it to finish
            await exports.checkDelegation(req, res, () => {});
        }

        if (roles.includes(req.user.role)) {
            return next();
        }

        if (roles.includes('Admin') && req.isActingAdmin) {
            return next();
        }

        return res.status(403).json({
            success: false,
            error: `User role ${req.user.role} is not authorized to access this route`
        });
    };
};
