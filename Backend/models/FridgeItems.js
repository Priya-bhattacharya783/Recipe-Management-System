const mongoose = require('mongoose');

const FridgeItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the User model
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('FridgeItem', FridgeItemSchema);