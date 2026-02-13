const express = require('express');
const router = express.Router();
const {
    submitContactForm,
    getContacts,
    markAsRead,
    deleteContact
} = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.post('/', submitContactForm);
router.get('/', protect, admin, getContacts);
router.put('/:id/read', protect, admin, markAsRead);
router.delete('/:id', protect, admin, deleteContact);

module.exports = router;
