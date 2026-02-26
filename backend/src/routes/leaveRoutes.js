const express = require('express');
const {
    getLeaves,
    getLeave,
    applyLeave,
    updateLeaveStatus,
    deleteLeave
} = require('../controllers/leaveController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

// Include other resource routers
const backupRouter = require('./backupRoutes');

router.use(protect);

// Re-route into other resource routers
router.use('/:id/backup', backupRouter);

router
    .route('/')
    .get(getLeaves)
    .post(applyLeave);

router
    .route('/:id')
    .get(getLeave)
    .put(authorize('Admin', 'Manager'), updateLeaveStatus)
    .delete(deleteLeave);

module.exports = router;
