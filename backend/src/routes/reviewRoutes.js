const express = require('express');
const {
    getPendingReviews,
    acceptDecision,
    overrideDecision
} = require('../controllers/reviewController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected and for Managers only
router.use(protect);
router.use(authorize('Manager'));

router.get('/', getPendingReviews);
router.post('/:type/:id/accept', acceptDecision);
router.post('/:type/:id/override', overrideDecision);

module.exports = router;
