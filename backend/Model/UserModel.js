const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  userId: {
    type: String, // Allows "DID" prefix
    unique: true, // Ensures this field is unique across documents
    required: true, // Ensure userId is required
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  nic: { //NIC field
    type: String,
    required: true, 
    trim: true,
    unique: true, // Ensures no duplicate NICs
  },
  number: {
    type: String, 
    required: true,
    trim: true,
    unique: true, // Ensures no duplicate phone numbers
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Ensures no duplicate emails
  },
  
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

// Pre-save hook to set userId
userSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastUser = await this.model('User').findOne().sort({ userId: -1 });
    const lastUserId = lastUser ? parseInt(lastUser.userId.slice(3), 10) : 0; // Extract numeric part
    this.userId = `DID${lastUserId + 1}`; // Auto-increment userId
  }
  next();
});

// Export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;
