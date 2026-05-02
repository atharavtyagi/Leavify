const express = require('express');
const {
    getChat,
    sendMessage,
    markSeen
} = require('../controllers/chatController');

const { protect, checkDelegation } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Multer

const router = express.Router();

// All chat routes require authentication and delegation context
router.use(protect);
router.use(checkDelegation);

router
    .route('/:contextType/:contextId')
    .get(getChat);

// The 'attachment' matches the FormData key we'll send from the frontend
router
    .route('/:contextType/:contextId/message')
    .post(upload.single('attachment'), sendMessage);

router
    .route('/:contextType/:contextId/seen')
    .patch(markSeen);

module.exports = router;
