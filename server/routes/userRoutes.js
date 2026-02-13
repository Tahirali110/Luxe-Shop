const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const {
    authUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    addAddress,
    deleteAddress,
    addPaymentMethod,
    deletePaymentMethod,
    addUpi,
    deleteUpi,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    syncCart,
    syncWishlist,
} = require('../controllers/userController');

// Public routes
router.post('/', registerUser);
router.post('/login', authUser);

// User protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/profile/address', protect, addAddress);
router.delete('/profile/address/:id', protect, deleteAddress);
router.post('/profile/payment', protect, addPaymentMethod);
router.delete('/profile/payment/:id', protect, deletePaymentMethod);
router.post('/profile/upi', protect, addUpi);
router.delete('/profile/upi/:id', protect, deleteUpi);
router.put('/profile/cart', protect, syncCart);
router.put('/profile/wishlist', protect, syncWishlist);

// Admin routes
router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUserById);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
