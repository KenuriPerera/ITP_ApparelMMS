//backend/Controllers/VehicleController.js
const Vehicle = require('../Model/VehicleModel'); // Adjust the path as needed

// Register a new vehicle
const registerVehicle = async (req, res) => {
  try {
    const { vehicleId, owner, make, model, year, color, licensePlate } = req.body;

    // Create a new vehicle instance
    const newVehicle = new Vehicle({
      vehicleId,
      owner,
      make,
      model,
      year,
      color,
      licensePlate,
    });

    // Save the vehicle in the database
    const savedVehicle = await newVehicle.save();
    res.status(201).json(savedVehicle);
  } catch (error) {
    // Handle duplicate key errors (unique fields)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'License plate already exists.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get all vehicles
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a vehicle by ID
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a vehicle by ID
const updateVehicleById = async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(200).json(updatedVehicle);
  } catch (error) {
    // Handle duplicate key errors (unique fields)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'License plate already exists.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete a vehicle by ID
const deleteVehicleById = async (req, res) => {
  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deletedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export all functions
module.exports = {
  registerVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicleById,
  deleteVehicleById,
};