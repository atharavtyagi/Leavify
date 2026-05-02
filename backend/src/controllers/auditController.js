const AuditLog = require('../models/AuditLog');
const LoginHistory = require('../models/LoginHistory');
const User = require('../models/User');

// @desc    Get all audit logs (Admin only)
// @route   GET /api/audit/logs
// @access  Private/Admin
exports.getAuditLogs = async (req, res) => {
    try {
        const { action, userId, startDate, endDate } = req.query;
        let query = {};

        if (req.user.role === 'Manager') {
            if (!req.user.department) {
                return res.status(403).json({ success: false, error: 'Manager department not found' });
            }
            // Managers can only see logs for their department
            const deptUsers = await User.find({ department: req.user.department }).select('_id');
            const deptUserIds = deptUsers.map(u => u._id);
            
            query = {
                $or: [
                    { performedBy: { $in: deptUserIds } },
                    { targetUser: { $in: deptUserIds } }
                ]
            };
        }

        if (action) query.action = action;
        if (userId) {
            // If manager, verify the requested userId is in their dept
            if (req.user.role === 'Manager') {
                const targetU = await User.findById(userId);
                if (!targetU || targetU.department !== req.user.department) {
                    return res.status(403).json({ success: false, error: 'Not authorized to see logs for this user' });
                }
            }
            query.performedBy = userId;
        }

        if (startDate || endDate) {
            query.timestamp = query.timestamp || {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(query)
            .populate('performedBy', 'name email role department')
            .populate('targetUser', 'name email role department')
            .sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        console.error('getAuditLogs Error:', error);
        res.status(500).json({ success: false, error: 'Server Error', details: error.message });
    }
};

// @desc    Get all login history (Admin only)
// @route   GET /api/audit/login-history
// @access  Private/Admin
exports.getLoginHistory = async (req, res) => {
    try {
        let query = {};
        
        if (req.user.role === 'Manager') {
            const deptUsers = await User.find({ department: req.user.department }).select('_id');
            const deptUserIds = deptUsers.map(u => u._id);
            query.user = { $in: deptUserIds };
        }

        const history = await LoginHistory.find(query)
            .populate('user', 'name email role department')
            .sort({ loginTime: -1 });

        res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        console.error('getLoginHistory Error:', error);
        res.status(500).json({ success: false, error: 'Server Error', details: error.message });
    }
};

// @desc    Get my audit logs
// @route   GET /api/audit/me/logs
// @access  Private
exports.getMyAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find({ performedBy: req.user.id })
            .sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        console.error('getMyAuditLogs Error:', error);
        res.status(500).json({ success: false, error: 'Server Error', details: error.message });
    }
};

// @desc    Get my login history
// @route   GET /api/audit/me/login-history
// @access  Private
exports.getMyLoginHistory = async (req, res) => {
    try {
        const history = await LoginHistory.find({ user: req.user.id })
            .sort({ loginTime: -1 });

        res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        console.error('getMyLoginHistory Error:', error);
        res.status(500).json({ success: false, error: 'Server Error', details: error.message });
    }
};
