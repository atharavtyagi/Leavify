const express = require('express');
const { confirmBackup, declineBackup } = require('../controllers/backupController');
const { protect } = require('../middleware/authMiddleware');

// Using mergeParams: true allows this router to be accessed via the leaves route
const router = express.Router({ mergeParams: true });

router.post('/confirm', protect, confirmBackup);
router.post('/decline', protect, declineBackup);

module.exports = router;
