const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Import routes
const storeRouter = require("./Routes/StoreRoute");
const userRoutes = require('./Routes/UserRoute');
const vehicleRoutes=require('./Routes/VehicleRoute');


// Middleware
app.use(express.json());
app.use(cors());

// Use the routes
app.use("/stores", storeRouter);
app.use('/api', userRoutes);
app.use('/vehicles', vehicleRoutes);


// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = 4000;
const DB_URL = 'mongodb+srv://apparelmms:apparel@cluster0.et2it.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(DB_URL)
  .then(() => {
    console.log('MongoDB Connected Successfully!');
  })
  .catch((err) => console.log('MongoDB Connection Error!', err));

// Start the server
app.listen(PORT, () => {
  console.log(`App is running on ${PORT}!`);
});
