const User = require('../models/User');
const LeaveBalance = require('../models/LeaveBalance');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, department, skills } = req.body;

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role,
            department: department || 'General',
            skills: skills || []
        });

        // Initialize Leave Balance for new user
        await LeaveBalance.create({ user: user._id });

        sendTokenResponse(user, 201, res, req);
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'Duplicate field value entered' });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email and password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res, req);
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Return enriched context from middleware (checkDelegation)
        res.status(200).json({
            success: true,
            data: {
                ...user.toObject(),
                isCurrentlyOnLeave: req.isCurrentlyOnLeave || false,
                viewOnlyStatus: req.viewOnlyStatus || false,
                isActingManager: req.isActingManager || false,
                actingManagerDepts: req.actingManagerDepts || [],
                isActingAdmin: req.isActingAdmin || false,
                debug_now: new Date(),
                debug_role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.skills !== undefined) {
            user.skills = req.body.skills;
        }

        if (req.body.emailNotifications !== undefined) {
            user.emailNotifications = req.body.emailNotifications;
        }

        if (req.body.pushNotifications !== undefined) {
            user.pushNotifications = req.body.pushNotifications;
        }

        await user.save();

        const auditLogger = require('../utils/auditLogger');
        await auditLogger({
            action: 'USER_PROFILE_UPDATED',
            performedBy: user._id,
            role: user.role
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error('--- updateDetails error:', err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }
        res.status(500).json({ success: false, error: 'Server Error', details: err.message });
    }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({ success: false, error: 'Password incorrect' });
        }

        user.password = req.body.newPassword;
        await user.save();

        const auditLogger = require('../utils/auditLogger');
        await auditLogger({
            action: 'USER_PASSWORD_UPDATED',
            performedBy: user._id,
            role: user.role
        });

        sendTokenResponse(user, 200, res, req);
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

const sendTokenResponse = async (user, statusCode, res, req) => {
    // Create token
    const token = user.getSignedAccessToken();
    const refreshToken = user.getSignedRefreshToken();

    // Hash the refresh token and save in user
    const crypto = require('crypto');
    const hashedRefresh = crypto.createHash('sha256').update(refreshToken).digest('hex');
    user.refreshToken = hashedRefresh;
    await user.save({ validateBeforeSave: false });

    const auditLogger = require('../utils/auditLogger');
    const LoginHistory = require('../models/LoginHistory');

    // Only log history and emit audit log if this came from an actual login or register (not just a password update)
    if (req && (req.path === '/login' || req.path === '/register')) {
        const ipAddress = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'Unknown';
        const device = req.headers['user-agent'] || 'Unknown';

        await LoginHistory.create({
            user: user._id,
            ipAddress,
            device
        });

        await auditLogger({
            action: req.path === '/login' ? 'USER_LOGIN' : 'USER_REGISTER',
            performedBy: user._id,
            role: user.role
        });
    }

    const options = {
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes for access token cookie (optional)
        httpOnly: true
    };

    const refreshOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        path: '/api/auth/refresh' // restrict to refresh endpoint
    };

    // Check if manager is currently on leave
    let isCurrentlyOnLeave = false;
    if (user.role === 'Manager') {
        const Leave = require('../models/Leave');
        const now = new Date();
        // Robust 72-hour centered window for timezone shifts (IST/UTC)
        const startOfWindow = new Date(now.getTime() - 36 * 60 * 60 * 1000);
        const endOfWindow = new Date(now.getTime() + 36 * 60 * 60 * 1000);
        
        const activeLeave = await Leave.findOne({
            employee: user._id,
            status: 'Approved',
            startDate: { $lte: endOfWindow },
            endDate: { $gte: startOfWindow }
        });
        if (activeLeave) isCurrentlyOnLeave = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .cookie('refreshToken', refreshToken, refreshOptions)
        .json({
            success: true,
            token,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                skills: user.skills,
                isCurrentlyOnLeave
            }
        });
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res, next) => {
    let rawToken = req.body.refreshToken || (req.cookies && req.cookies.refreshToken);

    if (!rawToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        rawToken = req.headers.authorization.split(' ')[1];
    }

    if (!rawToken) {
        return res.status(401).json({ success: false, error: 'No refresh token provided' });
    }

    try {
        const crypto = require('crypto');
        const jwt = require('jsonwebtoken');

        const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
        const hashedRefresh = crypto.createHash('sha256').update(rawToken).digest('hex');

        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user || user.refreshToken !== hashedRefresh) {
            return res.status(401).json({ success: false, error: 'Invalid refresh token' });
        }

        // Generate new tokens
        const token = user.getSignedAccessToken();
        const newRefreshToken = user.getSignedRefreshToken();
        
        user.refreshToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            token,
            refreshToken: newRefreshToken
        });

    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized or token expired' });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+refreshToken');
        if (user) {
            user.refreshToken = undefined;
            await user.save({ validateBeforeSave: false });
        }

        const auditLogger = require('../utils/auditLogger');
        const LoginHistory = require('../models/LoginHistory');

        await auditLogger({
            action: 'USER_LOGOUT',
            performedBy: req.user.id,
            role: req.user.role
        });

        // Terminate active login history
        const latestHistory = await LoginHistory.findOne({ user: req.user.id }).sort({ loginTime: -1 });
        if (latestHistory && !latestHistory.logoutTime) {
            latestHistory.logoutTime = Date.now();
            await latestHistory.save();
        }

        res.status(200)
            .clearCookie('token')
            .clearCookie('refreshToken', { path: '/api/auth/refresh' })
            .json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
