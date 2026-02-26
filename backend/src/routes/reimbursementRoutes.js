const express = require('express');
const {
    applyReimbursement,
    getMyReimbursements,
    getAllReimbursements,
    approveReimbursement,
    rejectReimbursement,
    deleteReimbursement
} = require('../controllers/reimbursementController');

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Apply protect middleware to all routes (user must be logged in)
router.use(protect);

// Employee routes
router.post('/apply', protect, authorize('Employee'), upload.single('receiptUrl'), applyReimbursement);
router.get('/my', protect, authorize('Employee'), getMyReimbursements);

// Manager / Admin routes
router.get('/all', authorize('Manager', 'Admin'), getAllReimbursements);
router.patch('/:id/approve', authorize('Manager', 'Admin'), approveReimbursement);
router.patch('/:id/reject', authorize('Manager', 'Admin'), rejectReimbursement);

// Admin only routes
router.delete('/:id', authorize('Admin'), deleteReimbursement);

module.exports = router;
