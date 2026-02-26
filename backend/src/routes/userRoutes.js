const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');

const User = require('../models/User');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
    .route('/')
    .get(getUsers)
    .post(authorize('Admin'), createUser);

router
    .route('/:id')
    .get(getUser)
    .put(authorize('Admin'), updateUser)
    .delete(authorize('Admin'), deleteUser);

module.exports = router;
