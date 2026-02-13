const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');
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
            avatar: user.avatar,
            isAdmin: user.isAdmin,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Seed Admin Users
const seedAdmins = async () => {
    try {
        // Super Admin
        const superAdminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const superAdminExists = await User.findOne({ email: superAdminEmail });

        if (!superAdminExists) {
            await User.create({
                name: 'Super Admin',
                email: superAdminEmail,
                password: process.env.ADMIN_PASSWORD || '123456',
                isAdmin: true,
                role: 'admin',
            });
            console.log('Super Admin seeded');
        }

        // Demo Admin
        const demoAdminEmail = process.env.DEMO_ADMIN_EMAIL || 'demo@example.com';
        const demoAdminExists = await User.findOne({ email: demoAdminEmail });

        if (!demoAdminExists) {
            await User.create({
                name: 'Demo Admin',
                email: demoAdminEmail,
                password: process.env.DEMO_ADMIN_PASSWORD || '123456',
                isAdmin: true,
                role: 'demo_admin',
            });
            console.log('Demo Admin seeded');
        }
    } catch (error) {
        console.error('Error seeding admins:', error);
    }
};

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
            avatar: user.avatar,
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
    const user = await User.findById(req.user._id)
        .populate('wishlist')
        .populate('cart.product');

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            isAdmin: user.isAdmin,
            addresses: user.addresses,
            paymentMethods: user.paymentMethods,
            upiIds: user.upiIds,
            wishlist: user.wishlist,
            cart: user.cart,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.avatar !== undefined) {
            user.avatar = req.body.avatar;
        }
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Sync cart
// @route   PUT /api/users/profile/cart
// @access  Private
const syncCart = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.cart = req.body.cart;
        await user.save();
        const updatedUser = await User.findById(user._id).populate('cart.product');
        res.json(updatedUser.cart);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Sync wishlist
// @route   PUT /api/users/profile/wishlist
// @access  Private
const syncWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.wishlist = req.body.wishlist;
        await user.save();
        const updatedUser = await User.findById(user._id).populate('wishlist');
        res.json(updatedUser.wishlist);
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

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    const orders = await Order.find({});

    const usersWithStats = users.map(user => {
        const userOrders = orders.filter(order => order.user.toString() === user._id.toString());
        const totalSpent = userOrders.reduce((sum, order) => {
            // Only count completed/paid orders or all valid orders (excluding cancelled/failed)
            if (order.paymentStatus !== 'Failed' && order.orderStatus !== 'Cancelled') {
                return sum + (order.totals ? order.totals.total : 0);
            }
            return sum;
        }, 0);

        return {
            ...user.toObject(),
            totalOrders: userOrders.length,
            totalSpent
        };
    });

    res.json(usersWithStats);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.isAdmin) {
            res.status(400);
            throw new Error('Cannot delete admin user');
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
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
    seedAdmins,
};
