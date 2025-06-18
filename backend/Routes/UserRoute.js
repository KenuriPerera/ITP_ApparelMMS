const express = require('express');
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} = require('../Controllers/UserController');

const router = express.Router();

// Route to create a new user
router.post('/users', createUser);

// Route to get all users
router.get('/users', getAllUsers);

// Route to get a user by ID
router.get('/users/:id', getUserById);

// Route to update a user by ID
router.put('/users/:id', updateUserById);

// Route to delete a user by ID
router.delete('/users/:id', deleteUserById);

module.exports = router;
