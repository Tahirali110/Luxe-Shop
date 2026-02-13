const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.memoryStorage();

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload an image');
    }

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;

    res.send(dataUri);
});

module.exports = router;
