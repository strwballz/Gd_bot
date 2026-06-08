const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    accountID: { type: String, required: true, unique: true },
    playerID: { type: String, required: true },
    userName: { type: String },
    registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', ProfileSchema);
