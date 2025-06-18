const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    storeID: { type: String, unique: true },
    name: { type: String, required: true },
    owner_name: { type: String, required: true },
    email: { type: String, required: true },
    phone_number: { type: String, required: true },
    address: { type: String, required: true }
    
});

module.exports = mongoose.model('Store', storeSchema);
