const express = require('express');
const { getMyBalance, getBalances, adjustBalance } = require('../controllers/balanceController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/me', getMyBalance);
router.get('/', authorize('Admin'), getBalances);
router.put('/:id', authorize('Admin'), adjustBalance);

module.exports = router;
