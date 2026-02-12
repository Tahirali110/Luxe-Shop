const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = mongoose.Schema({
    label: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    isDefault: { type: Boolean, default: false }
});

const paymentSchema = mongoose.Schema({
    cardNumber: { type: String, required: true },
    cardName: { type: String, required: true },
    expiryDate: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

const upiSchema = mongoose.Schema({
    upiId: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        addresses: [addressSchema],
        paymentMethods: [paymentSchema],
        upiIds: [upiSchema],
        wishlist: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }],
        cart: [{
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            color: String,
            size: String,
            quantity: { type: Number, default: 1 }
        }]
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
