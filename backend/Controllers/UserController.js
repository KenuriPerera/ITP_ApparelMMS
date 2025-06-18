const User = require('../Model/UserModel'); // Adjust the path as needed

// Create a new user
const createUser = async (req, res) => {
  try {
    const { userId, name, nic, number, email } = req.body; // Include address in destructuring

    // Check if the userId is already taken
    const existingUserId = await User.findOne({ userId });
    if (existingUserId) {
      return res.status(400).json({ message: 'Driver ID already exists.' });
    }

    // Create a new user instance
    const newUser = new User({
      userId,
      name,
      nic,
      number,
      email,
    });

    // Save the user in the database
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    // Handle duplicate key errors (unique fields)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Phone number or email already exists.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a user by ID (using _id)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // Get user by _id
    if (!user) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a user by ID (using _id)
const updateUserById = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, // Use _id from URL params
      req.body,
      { new: true, runValidators: true } // Return the updated user and run validations
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    // Handle duplicate key errors (unique fields)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Phone number or email already exists.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete a user by ID (using _id)
const deleteUserById = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id); // Use _id from URL params
    if (!deletedUser) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.status(200).json({ message: 'Driver record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export all functions
module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
