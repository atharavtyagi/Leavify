const express = require('express');
const {
    getManagers,
    checkActingAdminStatus,
    getReviewPending,
    verifyDelegationAction
} = require('../controllers/adminDelegationController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/managers', authorize('Admin'), getManagers);
router.get('/status', authorize('Manager'), checkActingAdminStatus);
router.get('/review', authorize('Admin'), getReviewPending);
router.patch('/verify/:type/:id', authorize('Admin'), verifyDelegationAction);

module.exports = router;
