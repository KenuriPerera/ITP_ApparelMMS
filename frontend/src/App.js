import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Components/home/Store';
import Home1 from './Components/home/Home1';
import UserDetails from './Components/home/UserDetails';
import VehicleDetails from './Components/home/Vehicle';
import Login from './Components/Login/Login'; // Import the Login component
// Ensure this matches the file name

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home1 />} />
      <Route path="/stores" element={<Home />} />
      <Route path="/users" element={<UserDetails />} />
      <Route path="/vehicle" element={<VehicleDetails />} />
      <Route path="/login" element={<Login />} />
      
      
      
       

      

      {/* Route for handling 404 - Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div>
      <h2>404 - Not Found</h2>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}

export default App;
