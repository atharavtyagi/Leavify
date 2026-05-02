const express = require('express');
const {
    getLeaves,
    getLeave,
    applyLeave,
    updateLeaveStatus,
    deleteLeave,
    reviewActingManagerLeave
} = require('../controllers/leaveController');

const router = express.Router();

const { protect, authorize, checkDelegation } = require('../middleware/authMiddleware');

// Include other resource routers
const backupRouter = require('./backupRoutes');

router.use(protect);

// Re-route into other resource routers
router.use('/:id/backup', backupRouter);

router
    .route('/')
    .get(checkDelegation, getLeaves)
    .post(applyLeave);

router
    .route('/:id')
    .get(getLeave)
    .put(authorize('Admin', 'Manager'), updateLeaveStatus)
    .delete(deleteLeave);

router.post('/:id/review', authorize('Manager', 'Admin'), reviewActingManagerLeave);

module.exports = router;
