const express = require('express');
const {
    getAuditLogs,
    getLoginHistory,
    getMyAuditLogs,
    getMyLoginHistory
} = require('../controllers/auditController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/me/logs', getMyAuditLogs);
router.get('/me/login-history', getMyLoginHistory);

router.get('/logs', authorize('Admin', 'Manager'), getAuditLogs);
router.get('/login-history', authorize('Admin', 'Manager'), getLoginHistory);

module.exports = router;
