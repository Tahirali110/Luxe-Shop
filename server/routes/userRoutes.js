const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    authUser,
    registerUser,
    getUserProfile,
    addAddress,
    deleteAddress,
    addPaymentMethod,
    deletePaymentMethod,
    addUpi,
    deleteUpi,
} = require('../controllers/userController');

router.post('/', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.post('/profile/address', protect, addAddress);
router.delete('/profile/address/:id', protect, deleteAddress);
router.post('/profile/payment', protect, addPaymentMethod);
router.delete('/profile/payment/:id', protect, deletePaymentMethod);
router.post('/profile/upi', protect, addUpi);
router.delete('/profile/upi/:id', protect, deleteUpi);

module.exports = router;
