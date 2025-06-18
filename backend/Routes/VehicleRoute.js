// backend/Routes/VehicleRoute.js
const express = require('express');
const {
  registerVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicleById,
  deleteVehicleById,
} = require('../Controllers/VehicleController'); // Adjust the path as needed

const router = express.Router();

// Register a new vehicle
router.post('/', registerVehicle);

// Get all vehicles
router.get('/', getAllVehicles);

// Get a vehicle by ID
router.get('/:id', getVehicleById);

// Update a vehicle by ID
router.put('/:id', updateVehicleById);

// Delete a vehicle by ID
router.delete('/:id', deleteVehicleById);

// Export the router
module.exports = router;
