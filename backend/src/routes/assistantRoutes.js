const express = require('express');
const { processQuery } = require('../controllers/assistantController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all assistant routes
router.use(protect);

router.post('/query', processQuery);

module.exports = router;
