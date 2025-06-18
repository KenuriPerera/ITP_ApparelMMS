import React from 'react';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Import the CSS file

function Navbar() {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="static" sx={{ backgroundColor: 'black', width: '200px' }}>
        <Toolbar sx={{ flexDirection: 'column', alignItems: 'flex-start', height: '100vh' }}>
          {/* Image at the top of the navbar */}
          <img
            src={require('../Images/logo.png')} // Replace with the path to your image
            alt="Logo"
            style={{ width: '100%', height: 'auto', marginBottom: '16px' }} // Adjust styles as needed
          />
          {/* Navbar Items */}
          <Typography variant="h5" component="div" className="navbar-title">
            <div className="navbar-links">
              <Button color="inherit" component={Link} to="/">Home</Button>
              <Button color="inherit" component={Link} to="/stores">Store Registration</Button>
              <Button color="inherit" component={Link} to="/users">Driver Check</Button>
              <Button color="inherit" component={Link} to="/vehicle">Register a Vehicle</Button>
            </div>
          </Typography>
          {/* Logout Button */}
          <Box sx={{ marginTop: 'auto', width: '100%', textAlign: 'center', }}>
            <Button variant="contained" color="secondary" component={Link} to="/login" >Logout</Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box className="content">
        {/* Your page content goes here */}
      </Box>
    </Box>
  );
}

export default Navbar;
