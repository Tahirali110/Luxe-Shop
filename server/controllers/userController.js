const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            addresses: user.addresses,
            paymentMethods: user.paymentMethods,
            upiIds: user.upiIds,
            wishlist: user.wishlist,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Add new address
// @route   POST /api/users/profile/address
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { label, firstName, lastName, email, phone, addressLine1, addressLine2, city, state, zipCode, country, isDefault } = req.body;

        const newAddress = {
            label,
            firstName,
            lastName,
            email,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            zipCode,
            country,
            isDefault: isDefault || false
        };

        if (newAddress.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push(newAddress);
        await user.save();
        res.status(201).json(user.addresses);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete address
// @route   DELETE /api/users/profile/address/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
        await user.save();
        res.json(user.addresses);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Add payment method
// @route   POST /api/users/profile/payment
// @access  Private
const addPaymentMethod = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { cardNumber, cardName, expiryDate, isDefault } = req.body;
        const newPayment = { cardNumber, cardName, expiryDate, isDefault: isDefault || false };

        if (newPayment.isDefault) {
            user.paymentMethods.forEach(p => p.isDefault = false);
        }

        user.paymentMethods.push(newPayment);
        await user.save();
        res.status(201).json(user.paymentMethods);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete payment method
// @route   DELETE /api/users/profile/payment/:id
// @access  Private
const deletePaymentMethod = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.paymentMethods = user.paymentMethods.filter(p => p._id.toString() !== req.params.id);
        await user.save();
        res.json(user.paymentMethods);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Add UPI ID
// @route   POST /api/users/profile/upi
// @access  Private
const addUpi = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { upiId, isDefault } = req.body;
        const newUpi = { upiId, isDefault: isDefault || false };

        if (newUpi.isDefault) {
            user.upiIds.forEach(u => u.isDefault = false);
        }

        user.upiIds.push(newUpi);
        await user.save();
        res.status(201).json(user.upiIds);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete UPI ID
// @route   DELETE /api/users/profile/upi/:id
// @access  Private
const deleteUpi = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.upiIds = user.upiIds.filter(u => u._id.toString() !== req.params.id);
        await user.save();
        res.json(user.upiIds);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    authUser,
    registerUser,
    getUserProfile,
    addAddress,
    deleteAddress,
    addPaymentMethod,
    deletePaymentMethod,
    addUpi,
    deleteUpi,
};
