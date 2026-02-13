const express = require('express');
const router = express.Router();
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.route('/').get(protect, admin, getNotifications);
router.route('/read-all').put(protect, admin, markAllAsRead);
router.route('/:id/read').put(protect, admin, markAsRead);
router.route('/:id').delete(protect, admin, deleteNotification);

module.exports = router;
