import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
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
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const UserDetails = () => {
  const [users, setUsers] = useState([]);
  const [userData, setUserData] = useState({ userId: 'DID', name: '', email: '', number: '', nic: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});

  // Fetch users from API on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/users');
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        setError('Error fetching Drivers');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle input change with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Restrict name field to letters and spaces only
    if (name === 'name' && !/^[a-zA-Z\s]*$/.test(value)) {
      return; // Prevent input of invalid characters
    }

    // Allow only numbers for the phone number field (up to 10 digits)
    if (name === 'number') {
      if (!/^\d{0,10}$/.test(value)) {
        return; // Prevent non-numeric input or more than 10 digits
      }
    }

    // Restrict NIC input to either 12 digits or 9 digits followed by uppercase V
    if (name === 'nic') {
      if (!/^\d{0,12}$|^\d{0,10}V?$/.test(value)) {
        return; // Prevent invalid NIC input
      }
    }

    setUserData({ ...userData, [name]: value });
    setErrors({ ...errors, [name]: '' }); // Clear error when user starts typing
  };

  // Validate user data
  const validateUserData = () => {
    const { userId, name, nic, email, number } = userData;
    const errors = {};

    // Validate userId (starts with "DID" followed by numbers)
    if (!userId) {
      errors.userId = 'User ID is required';
    } else if (!/^DID/.test(userId)) {
      errors.userId = 'User ID must start with "DID"';
    } else if (isNaN(userId.substring(3))) {
      errors.userId = 'User ID must be followed by numbers';
    }

    // Validate name (no digits allowed)
    if (!name.trim()) {
      errors.name = 'Name is required';
    } else if (/\d/.test(name)) {
      errors.name = 'Name cannot contain numbers';
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailPattern.test(email)) {
      errors.email = 'Invalid email format';
    }

    // Validate phone number (must be exactly 10 digits)
    const phonePattern = /^[0-9]{10}$/;
    if (!number.trim()) {
      errors.number = 'Phone number is required';
    } else if (!phonePattern.test(number)) {
      errors.number = 'Phone number must be exactly 10 digits';
    }

  // Validate NIC (12 digits or 11 digits followed by uppercase V)
if (!nic.trim()) {
  errors.nic = 'NIC is required';
} else if (!/^\d{12}$/.test(nic) && !/^\d{10}V$/.test(nic)) {
  errors.nic = 'NIC must be 12 digits or 10 digits followed by an uppercase V';
}


    return errors;
  };

  // Add user
  const addUser = async () => {
    const validationErrors = validateUserData();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await axios.post('http://localhost:4000/api/users', userData);
      setUserData({ userId: '', name: '', nic: '', email: '', number: '' }); // Reset form fields
      setIsAdding(false); // Hide add form
      // Fetch the updated user list
      const response = await axios.get('http://localhost:4000/api/users');
      setUsers(response.data);
    } catch (error) {
      alert('Error adding Driver: ' + error.response.data.message);
    }
  };

  // Edit user
  const handleEditClick = (user) => {
    setSelectedUser(user._id);
    setUserData({ userId: user.userId, name: user.name, nic: user.nic, email: user.email, number: user.number });
  };

  // Update user
  const updateUser = async () => {
    if (!selectedUser) return;

    const validationErrors = validateUserData();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await axios.put(`http://localhost:4000/api/users/${selectedUser}`, userData);
      setUserData({ userId: '', name: '', nic: '', email: '', number: '' });
      setSelectedUser(null);
      // Fetch the updated user list
      const response = await axios.get('http://localhost:4000/api/users');
      setUsers(response.data);
    } catch (error) {
      alert('Error updating Driver: ' + error.response.data.message);
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/users/${id}`);
      // Fetch the updated user list
      const response = await axios.get('http://localhost:4000/api/users');
      setUsers(response.data);
    } catch (error) {
      alert('Error deleting Driver: ' + error.response.data.message);
    }
  };

  // Filtered users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nic.toLowerCase().includes(searchTerm.toLowerCase())||
      user.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Download PDF
const downloadPdf = () => {
  const doc = new jsPDF();

  // Add logo image
  const logo = new Image();
  logo.src = require('../Images/logo.png');

  logo.onload = () => {
    // Set margins
    const margin = 15; // Margin from the border
    const frameMargin = 10; // Frame inside the page margin
    const logoX = margin + 5; // Position the logo with extra space from the margin
    const logoY = margin + 5;

    // Add logo to the PDF
    doc.addImage(logo, 'PNG', logoX, logoY, 50, 20); // Adjust as needed

    // Set font to sans-serif for all text
    doc.setFont('sans-serif');

    // Add header text
    doc.setFontSize(20);
    doc.text('DILFER Apparel Pvt(Ltd)', logoX + 60, logoY + 15);

    // Draw line under header
    doc.setFontSize(13);
    doc.line(margin, logoY + 30, doc.internal.pageSize.width - margin, logoY + 30); // Horizontal line under the header
    doc.text('Driver Registration List', logoX + 60, logoY + 25); // Positioned under the header text

    // Define the table columns and rows
    const tableColumn = ['User ID', 'Name', 'NIC', 'Email', 'Phone Number'];
    const tableRows = filteredUsers.map(user => [
      user.userId,
      user.name,
      user.nic,
      user.email,
      user.number,
    ]);

    // Generate the table
    doc.autoTable(tableColumn, tableRows, {
      startY: logoY + 40, // Start the table below the header
      styles: {
        minCellHeight: 10,
        cellPadding: 5,
        font: 'sans-serif', // Ensure sans-serif font in the table
      },
    });

    // Get the position to place the signature below the table
    const finalY = doc.lastAutoTable.finalY + 20;

    // Add signature and other details
    doc.setFontSize(11);
    doc.text('Signature: ___________________________', 110, finalY + 10);
    doc.text('Authorized by: Dilfer Apparel Pvt(Ltd)', 110, finalY + 20);
    doc.text('Date: ' + new Date().toLocaleDateString(), 110, finalY + 30);

    // Add the footer with white text on black background
    const footerText = '© Dilfer Clothing. All rights reserved.';
    const pageHeight = doc.internal.pageSize.height;
    const footerY = pageHeight - 20; // Positioning 20 units from the bottom

    // Set the background color for the footer area to black
    doc.setFillColor(0, 0, 0); // Black background
    doc.rect(margin, footerY - 5, doc.internal.pageSize.width - 2 * margin, 10, 'F'); // Draw filled rectangle

    // Set text color to white
    doc.setTextColor(255, 255, 255); // White text color
    doc.setFontSize(10);
    doc.text(footerText, margin + 5, footerY); // Add some space from the left margin

    // Draw a frame around the content
    doc.setDrawColor(0, 0, 0); // Set frame color to black
    doc.setLineWidth(0.5); // Set a thinner line for the frame
    const frameX = margin - frameMargin; // Frame starts slightly inside the margin
    const frameY = margin - frameMargin;
    const frameWidth = doc.internal.pageSize.width - 2 * frameX; // Width reduced by twice the frameX margin
    const frameHeight = pageHeight - 2 * frameY; // Height reduced by twice the frameY margin
    doc.rect(frameX, frameY, frameWidth, frameHeight); // Draw the frame

    // Save the generated PDF
    doc.save('user_details.pdf');
  };
};



  // Form for adding/editing user
  const renderForm = () => (
    <Box component="form" noValidate autoComplete="off">
      <TextField
        name="userId"
        label="User ID (DID####)"
        value={userData.userId}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        error={!!errors.userId}
        helperText={errors.userId}
      />
      <TextField
        name="name"
        label="Name"
        value={userData.name}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        error={!!errors.name}
        helperText={errors.name}
      />
      <TextField
        name="email"
        label="Email"
        value={userData.email}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        error={!!errors.email}
        helperText={errors.email}
      />
      <TextField
        name="number"
        label="Phone Number"
        value={userData.number}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        error={!!errors.number}
        helperText={errors.number}
      />
      <TextField
        name="nic"
        label="NIC"
        value={userData.nic}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        error={!!errors.nic}
        helperText={errors.nic}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={selectedUser ? updateUser : addUser}
        sx={{ mt: 2 }}
      >
        {selectedUser ? 'Update User' : 'Add User'}
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
    <Container sx={{ flex: 1, padding: '20px' }} >
      
      <Typography variant="h4" gutterBottom>
        Driver Management
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TextField
            label="Search by Name,Email or NIC"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>NIC</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.nic}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.number}</TableCell>
                    <TableCell>
                      <Button 
                      variant='contained'
                      onClick={() => handleEditClick(user)}
                      style={{fontFamily: 'helvetica',fontWeight:"bold", backgroundColor:'gold',color:'black'}}>
                        
                        Edit
                        </Button>
                      <Button
                       variant='contained'
                       onClick={() => deleteUser(user._id)} 
                       style={{fontFamily: 'helvetica',fontWeight:"bold", backgroundColor:'red',color:'white'}}>
                      
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {isAdding && renderForm()}
          {selectedUser && renderForm()}
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsAdding(!isAdding)}
            style={{ marginLeft: '10px', backgroundColor:"Mediumblue", fontWeight:"bold" ,color:"white" }}
            sx={{ mt: 2 }}
          >
            {isAdding ? 'Cancel' : 'Add New Driver'}
          </Button> 
          <Button
            variant="contained"
            onClick={downloadPdf}
            style={{ marginLeft: '10px', backgroundColor:"SeaGreen", fontWeight:"bold" ,color:"white" }}
            sx={{ mt: 2 }}
          >
            Download PDF
          </Button>
        </>
      )}
    </Container>
    </Box>
  );
};

export default UserDetails;
