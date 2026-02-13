const Contact = require('../models/Contact');
const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');

// @desc    Submit a contact form
// @route   POST /api/contacts
// @access  Public
const submitContactForm = asyncHandler(async (req, res) => {
    const { name, email, subject, message, type } = req.body;

    const contact = await Contact.create({
        name,
        email,
        subject,
        message,
        type: type || 'message'
    });

    if (contact) {
        // Create admin notification
        await Notification.create({
            message: type === 'call_request'
                ? `New call request from ${name}`
                : `New message from ${name}: ${subject}`,
            type: 'contact',
            dataId: contact._id.toString(),
        });

        res.status(201).json({
            message: 'Contact form submitted successfully',
        });
    } else {
        res.status(400);
        throw new Error('Invalid contact data');
    }
});

// @desc    Get all contact submissions
// @route   GET /api/contacts
// @access  Private/Admin
const getContacts = asyncHandler(async (req, res) => {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.json(contacts);
});

// @desc    Mark contact as read
// @route   PUT /api/contacts/:id/read
// @access  Private/Admin
const markAsRead = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (contact) {
        contact.isRead = true;
        await contact.save();
        res.json({ message: 'Contact marked as read' });
    } else {
        res.status(404);
        throw new Error('Contact not found');
    }
});

// @desc    Delete contact submission
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
const deleteContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (contact) {
        await contact.deleteOne();
        res.json({ message: 'Contact removed' });
    } else {
        res.status(404);
        throw new Error('Contact not found');
    }
});

module.exports = {
    submitContactForm,
    getContacts,
    markAsRead,
    deleteContact
};
