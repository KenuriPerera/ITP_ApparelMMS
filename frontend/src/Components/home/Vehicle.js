import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Typography,
  Alert,
  Box,
  Container,
} from '@mui/material';
import Navbar from '../Nav/Navbar';

const VehicleDetails = () => {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleData, setVehicleData] = useState({
    vehicleId: '',
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    owner: '',
    color: '',
  });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch vehicles from API on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('http://localhost:4000/vehicles');
        setVehicles(response.data);
      } catch (error) {
        setError('Error fetching vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Validate vehicle data
  const validateVehicleData = () => {
    const errors = {};
    const currentYear = new Date().getFullYear(); // Get the current year

    if (!vehicleData.vehicleId) {
      errors.vehicleId = 'Vehicle ID is required';
    }
    if (!vehicleData.make) errors.make = 'Make is required';
    if (!vehicleData.model) errors.model = 'Model is required';

    // Year validation: only 4 digits starting with 19 or 20 and not exceeding current year
    if (!vehicleData.year) {
      errors.year = 'Year is required';
    } else if (!/^(19|20)\d{2}$/.test(vehicleData.year)) {
      errors.year = 'Year must be 4 digits starting with "19" or "20"';
    } else if (parseInt(vehicleData.year) > currentYear) {
      errors.year = 'Year cannot be in the future';
    }

    if (!vehicleData.licensePlate) {
      errors.licensePlate = 'License Plate is required';
    } else if (!/^[A-Z]{1,3}[0-9]{0,4}$/.test(vehicleData.licensePlate)) {
      errors.licensePlate = 'License Plate must have up to 3 capital letters and up to 4 digits';
    }
    if (!vehicleData.owner) {
      errors.owner = 'Owner is required';
    } else if (!/^[A-Za-z\s]+$/.test(vehicleData.owner)) { // Only letters and spaces allowed
      errors.owner = 'Owner name must only contain letters and spaces';
    }
    if (!vehicleData.color) errors.color = 'Color is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Restrict input for year to only numbers and limit to 4 characters
    if (name === 'year') {
      if (!/^\d*$/.test(value) || value.length > 4) {
        return; // Ignore input if it contains invalid characters or exceeds length
      }
    }

    // Allow only letters and spaces for the owner's name
    if (name === 'owner' && !/^[A-Za-z\s]*$/.test(value)) {
      return; // Ignore input if it contains invalid characters
    }

    if (name === 'licensePlate') {
      if (!/^[A-Za-z0-9]*$/.test(value) || value.length > 8) {
        return; // Ignore input if it contains invalid characters or exceeds length
      }
    }
    setVehicleData((prevData) => ({ ...prevData, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  // Add vehicle
  const addVehicle = async () => {
    if (!validateVehicleData()) return;

    const isDuplicateLicensePlate = vehicles.some(
      (vehicle) => vehicle.licensePlate === vehicleData.licensePlate
    );

    if (isDuplicateLicensePlate) {
      alert('License Plate must be unique');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/vehicles', vehicleData);
      setVehicles((prevVehicles) => [...prevVehicles, response.data]);
      setSuccessMessage('Vehicle added successfully!');
      resetForm();
    } catch (error) {
      alert('Error adding vehicle: ' + (error.response?.data?.message || 'An error occurred'));
    }
  };

  // Edit vehicle
  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle._id);
    setVehicleData({
      vehicleId: vehicle.vehicleId,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      owner: vehicle.owner,
      color: vehicle.color,
    });
    setIsAdding(true);
    setSuccessMessage(''); // Clear success message when editing
  };

  // Update vehicle
  const updateVehicle = async () => {
    if (!validateVehicleData()) return;
    if (!selectedVehicle) return;

    try {
      await axios.put(`http://localhost:4000/vehicles/${selectedVehicle}`, vehicleData);
      setVehicles((prevVehicles) =>
        prevVehicles.map((vehicle) =>
          vehicle._id === selectedVehicle ? { ...vehicle, ...vehicleData } : vehicle
        )
      );
      setSuccessMessage('Vehicle updated successfully!');
      resetForm();
    } catch (error) {
      alert('Error updating vehicle: ' + (error.response?.data?.message || 'An error occurred'));
    }
  };

  // Reset form data
  const resetForm = () => {
    setVehicleData({
      vehicleId: '',
      make: '',
      model: '',
      year: '',
      licensePlate: '',
      owner: '',
      color: '',
    });
    setSelectedVehicle(null);
    setIsAdding(false);
    setSuccessMessage(''); // Clear success message on reset
  };

  // Delete vehicle
  const deleteVehicle = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/vehicles/${id}`);
      setVehicles((prevVehicles) => prevVehicles.filter((vehicle) => vehicle._id !== id));
    } catch (error) {
      alert('Error deleting vehicle: ' + (error.response?.data?.message || 'An error occurred'));
    }
  };

  // Generate PDF
const generatePDF = () => {
  const doc = new jsPDF();
  const logo = new Image();
  logo.src = require('../Images/logo.png'); // Adjust the path to your logo
  logo.onload = () => {
    // Set margins
    const margin = 15; 
    const logoX = margin + 5; 
    const logoY = margin + 5; 

    // Add the logo and position it
    doc.addImage(logo, 'PNG', logoX, logoY, 50, 20);

    // Set sans-serif font for the entire document
    doc.setFont('sans-serif');

    // Add the header text beside the logo
    doc.setFontSize(22);
    doc.text('DILFER Apparel Pvt(Ltd)', logoX + 60, logoY + 15); // Positioned beside the logo

    
    doc.setFontSize(15);
    doc.line(margin, logoY + 30, doc.internal.pageSize.width - margin, logoY + 30); // Horizontal line under the header
    doc.text('Records of the vehicles', logoX + 60, logoY + 25); // Positioned under the header text

    // Define the table columns and rows
    
    const tableColumn = ["Vehicle ID", "Make", "Model", "Year", "License Plate", "Owner", "Color"];
    const tableRows = vehicles.map(vehicle => [
      vehicle.vehicleId,
      vehicle.make,
      vehicle.model,
      vehicle.year,
      vehicle.licensePlate,
      vehicle.owner,
      vehicle.color,
    ]);

    // Generate the table
    doc.autoTable(tableColumn, tableRows, {
      startY: logoY + 40, // Start the table below the header
      styles: {
        minCellHeight: 10, // Adjust the minimum height of each cell
        cellPadding: 5,    // Adjust the cell padding
        font: 'sans-serif' // Ensure sans-serif font in the table
      },
    });

    // Get the position to place the signature below the table
    const finalY = doc.lastAutoTable.finalY + 20; // Adjust the spacing as needed

    // Add signature and other details
    doc.setFontSize(12);
    doc.text('Signature: ___________________________', 110, finalY + 10);
    doc.text('Authorized by: Dilfer Apparel Pvt(Ltd)', 110, finalY + 20);
    doc.text('Date: ' + new Date().toLocaleDateString(), 110, finalY + 30);

    // Add the footer with white text on black background
    const footerText = '© Dilfer Clothing. All rights reserved.';
    const pageHeight = doc.internal.pageSize.height;
    const footerY = pageHeight - 20; // Positioning 20 units from the bottom

    doc.setFillColor(0, 0, 0); // Black background
    doc.rect(margin, footerY - 5, doc.internal.pageSize.width - 2 * margin, 10, 'F'); // Draw filled rectangle

    doc.setTextColor(255, 255, 255); // White text color
    doc.setFontSize(11);
    doc.text(footerText, margin + 5, footerY); 

    //border
    doc.setDrawColor(0, 0, 0); // Set frame color to black
    doc.setLineWidth(0.5); // Set a thinner line for the frame
    const frameX = margin; 
    const frameY = margin;
    const frameWidth = doc.internal.pageSize.width - 2 * frameX;
    const frameHeight = pageHeight - 2 * frameY; 
    doc.rect(frameX, frameY, frameWidth, frameHeight); // frame

    doc.save('Vehicle_list.pdf');
  };
};
  // Filter vehicles based on search term
const filteredVehicles = vehicles.filter((vehicle) =>
  vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
  vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
  vehicle.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
  vehicle.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
  vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
  vehicle.year.toString().slice(-2).includes(searchTerm) // Filters by last 2 digits of the year
);


  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Navbar />
        <Container sx={{ flex: 1, padding: '20px', fontFamily: 'helvetica' }}>
          <Typography variant="h4" align="center" gutterBottom>
            Vehicle Management
          </Typography>
          <TextField
            label="Search"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: '20px', width: '100%' ,fontFamily: 'helvetica' }}
          />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{fontFamily: 'helvetica', fontWeight: 'bold'}}>Vehicle ID</TableCell>
                  <TableCell style={{fontFamily: 'helvetica', fontWeight: 'bold'}}>Make</TableCell>
                  <TableCell style={{fontFamily: 'helvetica', fontWeight: 'bold'}}>Model</TableCell>
                  <TableCell style={{fontFamily: 'helvetica', fontWeight: 'bold'}}>Year</TableCell>
                  <TableCell style={{fontFamily: 'helvetica', fontWeight: 'bold'}}>License Plate</TableCell>
                  <TableCell style={{fontFamily: 'helvetica', fontWeight: 'bold'}}>Owner</TableCell>
                  <TableCell style={{fontFamily: 'helvetica', fontWeight: 'bold'}}>Color</TableCell>
                  <TableCell style={{fontFamily: 'helvetica', fontWeight: 'bold'}}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle._id}>
                    <TableCell>{vehicle.vehicleId}</TableCell>
                    <TableCell>{vehicle.make}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell>{vehicle.licensePlate}</TableCell>
                    <TableCell>{vehicle.owner}</TableCell>
                    <TableCell>{vehicle.color}</TableCell>
                    <TableCell>
                      <Button variant="contained" onClick={() => handleEditClick(vehicle)}style={{ marginLeft: '10px',fontFamily: 'helvetica', backgroundColor: 'gold',color: 'black',fontweight: 'bold' }}>
                        Edit
                      </Button>
                      <Button variant="contained" color="error" onClick={() => deleteVehicle(vehicle._id)} style={{ marginLeft: '10px' ,fontFamily: 'helvetica',backgroundColor: 'red',fontweight: 'bold' }}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {successMessage && <Alert severity="success">{successMessage}</Alert>}
          
          <Paper style={{ padding: '20px', marginBottom: '20px' }}>
            <Typography variant="h5">{isAdding ? 'Edit Vehicle' : 'Add Vehicle'}</Typography>
            <TextField
              label="Vehicle ID"
              name="vehicleId"
              variant="outlined"
              value={vehicleData.vehicleId}
              onChange={handleInputChange}
              error={!!validationErrors.vehicleId}
              helperText={validationErrors.vehicleId}
              fullWidth
              style={{ marginBottom: '10px', fontFamily: 'helvetica' }}
            />
            <TextField
              label="Make"
              name="make"
              variant="outlined"
              value={vehicleData.make}
              onChange={handleInputChange}
              error={!!validationErrors.make}
              helperText={validationErrors.make}
              fullWidth
              style={{ marginBottom: '10px',fontFamily: 'helvetica' }}
            />
            <TextField
              label="Model"
              name="model"
              variant="outlined"
              value={vehicleData.model}
              onChange={handleInputChange}
              error={!!validationErrors.model}
              helperText={validationErrors.model}
              fullWidth
              style={{ marginBottom: '10px',fontFamily: 'helvetica' }}
            />
            <TextField
              label="Year"
              name="year"
              variant="outlined"
              value={vehicleData.year}
              onChange={handleInputChange}
              error={!!validationErrors.year}
              helperText={validationErrors.year}
              fullWidth
              style={{ marginBottom: '10px',fontFamily: 'helvetica'}}
            />
            <TextField
              label="License Plate"
              name="licensePlate"
              variant="outlined"
              value={vehicleData.licensePlate}
              onChange={handleInputChange}
              error={!!validationErrors.licensePlate}
              helperText={validationErrors.licensePlate}
              fullWidth
              style={{ marginBottom: '10px',fontFamily: 'helvetica' }}
            />
            <TextField
              label="Owner"
              name="owner"
              variant="outlined"
              value={vehicleData.owner}
              onChange={handleInputChange}
              error={!!validationErrors.owner}
              helperText={validationErrors.owner}
              fullWidth
              style={{ marginBottom: '10px',fontFamily: 'helvetica'}}
            />
            <TextField
              label="Color"
              name="color"
              variant="outlined"
              value={vehicleData.color}
              onChange={handleInputChange}
              error={!!validationErrors.color}
              helperText={validationErrors.color}
              fullWidth
              style={{ marginBottom: '20px',fontFamily: 'helvetica'}}
            />
            {isAdding ? (
              <Button variant="contained" color="primary" onClick={updateVehicle} style={{ marginLeft: '10px',fontFamily: 'helvetica',fontweight: 'bold' }}>
                Update Vehicle
              </Button>
            ) : (
              <Button variant="contained" color="primary" onClick={addVehicle} style={{ marginLeft: '10px',fontFamily: 'helvetica',fontweight: 'bold',backgroundColor: 'MediumBlue'}}>
                Add Vehicle
              </Button>
            )}
            <Button variant="contained" color="secondary" onClick={resetForm} style={{ marginLeft: '10px',fontFamily: 'helvetica',fontweight: 'bold' , backgroundColor: 'Tomato'}}>
              Reset
            </Button>
          </Paper>
          <Button variant="contained" onClick={generatePDF} style={{ marginBottom: '20px', fontFamily:'helvetica',fontWeight: 'bold',backgroundColor: 'Seagreen' }}>
            Download PDF
          </Button>
          
        </Container>
      </Box>
    </>
  );
};

export default VehicleDetails;