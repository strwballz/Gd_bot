const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    accountID: { type: String, required: true },
    playerID: { type: String, required: true },
    registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', ProfileSchema);
