//backend/Model/VehicleModel.js
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleId: {
    type: Number,
    unique: true,
  },
  owner: {
    type: String,  // Owner is a string
    required: true,
  },
  make: {
    type: String,
    required: true,
    trim: true,
  },
  model: {
    type: String,
    required: true,
    trim: true,
  },
  year: {
    type: Number,
    required: true,
    min: 1886,
  },
  color: {
    type: String,
    required: true,
    trim: true,
  },
  licensePlate: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;