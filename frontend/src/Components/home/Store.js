import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Button,
    TextField,
    Paper,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box
} from '@mui/material';
import Navbar from '../Nav/Navbar';
import jsPDF from 'jspdf';
import 'jspdf-autotable';



const Store = () => {
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [storeData, setStoreData] = useState({
        storeID: 'SID', name: '', owner_name: '', email: '', phone_number: '', address: ''
    });
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // Fetch stores from API
    const fetchStores = async () => {
        try {
            const response = await fetch('http://localhost:4000/stores');
            if (!response.ok) {
                throw new Error('Failed to fetch stores');
            }
            const data = await response.json();
            setStores(data);
        } catch (error) {
            setError('Error fetching stores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    // Handle input change with inline restrictions
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Inline validation for phone number - only allow digits and max length of 10
        if (name === 'phone_number') {
            const cleanedValue = value.replace(/[^0-9]/g, ''); // Remove any non-digit characters
            if (cleanedValue.length <= 10) { // Ensure it's no more than 10 digits
                setStoreData({ ...storeData, [name]: cleanedValue });
            }
            return; // Prevent further execution for this field
        }

        // Inline validation for owner_name - only allow alphabetic characters and spaces
        if (name === 'owner_name') {
            const cleanedValue = value.replace(/[^a-zA-Z\s]/g, ''); // Allow only letters and spaces
            setStoreData({ ...storeData, [name]: cleanedValue });
            return; // Prevent further execution for this field
        }

        // Default case for other fields
        setStoreData({ ...storeData, [name]: value });
        setValidationErrors({ ...validationErrors, [name]: '' }); // Reset validation error on input change
    };

    // Validate store data before submitting
    const validateStoreData = () => {
        const { storeID, phone_number, owner_name } = storeData;
        let errors = {};

        // Validate Store ID
        if (!storeID.startsWith('SID')) {
            errors.storeID = 'Store ID must start with "SID".';
        }

        // Validate Owner Name (only letters and spaces allowed
        const nameRegex = /^[A-Za-z\s]+$/; // Allows letters and spaces only
        if (!nameRegex.test(owner_name)) {
            errors.owner_name = 'Owner Name can only contain letters and spaces (no numbers or special characters).';
        }

        // Validate Phone Number (10 digits and starts with 07)
        if (!phone_number.startsWith('07') || phone_number.length !== 10 || isNaN(phone_number)) {
            errors.phone_number = 'Phone number must start with "07" and be 10 digits long.';
        }

        setValidationErrors(errors); // Update validation errors state
        return Object.keys(errors).length === 0; // Returns true if no errors
    };

    // Add a new store
    const addStore = async () => {
        if (!validateStoreData()) return; // Validate before proceeding

        try {
            const response = await fetch('http://localhost:4000/stores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(storeData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add store');
            }

            fetchStores();
            resetForm();
            setIsAdding(false);
        } catch (error) {
            alert(error.message);
        }
    };

    // Update store by ID
    const updateStore = async () => {
        if (!selectedStore || !validateStoreData()) return; // Validate before proceeding

        try {
            const response = await fetch(`http://localhost:4000/stores/${selectedStore}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(storeData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update store');
            }

            fetchStores();
            resetForm();
            setSelectedStore(null); // Clear the selected store
        } catch (error) {
            alert(error.message);
        }
    };

    // Delete store by ID
    const deleteStore = async (id) => {
        try {
            const response = await fetch(`http://localhost:4000/stores/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete store');
            }

            fetchStores();
        } catch (error) {
            alert(error.message);
        }
    };

   // Handle editing a store
const handleEditClick = (store) => {
    // Remove 'SID' from the beginning for user input if it exists
    const editableID = store.storeID.startsWith('SID') ? store.storeID.slice(3) : store.storeID;

    setStoreData({
        storeID: editableID, // Only the editable part is stored
        name: store.name,
        owner_name: store.owner_name,
        email: store.email,
        phone_number: store.phone_number,
        address: store.address,
    });
    setSelectedStore(store._id); // Store the ID for updating
    setIsAdding(true); // Show the form for editing
};

// Reset the form fields
const resetForm = () => {
    setStoreData({
        storeID: '', // Reset only the editable part, 'SID' will be added later
        name: '',
        owner_name: '',
        email: '',
        phone_number: '',
        address: '',
    });
    setValidationErrors({});
    setSelectedStore(null); // Reset selected store ID
    setIsAdding(false); // Hide the form after reset
};

// Handle input change
const handleInputChange1 = (e) => {
    const { name, value } = e.target;

    if (name === 'storeID') {
        
        setStoreData((prevData) => ({
            ...prevData,
            storeID: `SID${value.replace(/^SID/, '')}`, 
        }));
    } else {
        setStoreData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    if (validationErrors[name]) {
        setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
};

// Filter stores based on search term
const filteredStores = stores.filter((store) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
        store.name.toLowerCase().includes(searchTermLower) ||
        store.email.toLowerCase().includes(searchTermLower) ||
        store.owner_name.toLowerCase().includes(searchTermLower) ||
        store.storeID.toLowerCase().includes(searchTermLower) || // Include storeID in search filter
        store.phone_number.includes(searchTerm) // Search phone number without case conversion
    );
});


{isAdding && (
    <form style={{ marginTop: '20px', fontFamily: 'helvetica', fontWeight: 'bold' }}>
        <TextField
            label="Store ID"
            name="storeID"
            value={`SID${storeData.storeID}`} 
            onChange={handleInputChange1}
            error={!!validationErrors.storeID}
            helperText={validationErrors.storeID}
            fullWidth
            style={{ marginBottom: '20px' }}
        />
        {}
    </form>
)}

    // Download PDF
const downloadPdf = () => {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = require('../Images/logo.png');
    
    logo.onload = () => {
        // Set margins
        const margin = 15; // Margin from the border
        const logoX = margin + 5; // Position the logo with a little extra space from the margin
        const logoY = margin + 5;

        // Add logo to the PDF
        doc.addImage(logo, 'PNG', logoX, logoY, 50, 20);
        
        
        doc.setFont('sans-serif');

        // Add header text
        doc.setFontSize(20);
        doc.text('DILFER Apparel Pvt(Ltd)', logoX + 60, logoY + 15);
        
        // Draw line under header
        doc.setFontSize(12);
        doc.line(margin, logoY + 30, doc.internal.pageSize.width - margin, logoY + 30); // Horizontal line under the header
        doc.text('Store List', logoX + 60, logoY + 25); // Positioned under the header text

        // Define the table columns and rows
        const tableColumn = ['Store ID', 'Store Name', 'Owner Name', 'Email', 'Phone Number', 'Address'];
        const tableRows = filteredStores.map(store => [
            store.storeID,
            store.name,
            store.owner_name,
            store.email,
            store.phone_number,
            store.address,
        ]);

        // Generate the table
        doc.autoTable(tableColumn, tableRows, {
            startY: logoY + 40, // Start the table below the header
            styles: {
                minCellHeight: 10,
                cellPadding: 5,
                font: 'sans-serif',
                fontSize: 10, // Ensure sans-serif font in the table
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

        
        doc.setFillColor(0, 0, 0); // Black background
        doc.rect(margin, footerY - 5, doc.internal.pageSize.width - 2 * margin, 10, 'F'); // Draw filled rectangle

        // Set text color to white
        doc.setTextColor(255, 255, 255); // White text color
        doc.setFontSize(11);
        doc.text(footerText, margin + 5, footerY); // Add some space from the left margin

        // Draw a frame around the content
    doc.setDrawColor(0, 0, 0); // Set frame color to black
    doc.setLineWidth(0.5); // Set a thinner line for the frame
    const frameX = margin // Frame starts slightly inside the margin
    const frameY = margin;
    const frameWidth = doc.internal.pageSize.width - 2 * frameX; // Width reduced by twice the frameX margin
    const frameHeight = pageHeight - 2 * frameY; // Height reduced by twice the frameY margin
    doc.rect(frameX, frameY, frameWidth, frameHeight); // Draw the frame

        // Save the generated PDF
        doc.save('Registered Store-list.pdf');
    };
};


    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <Navbar />
                <Container sx={{ flex: 1, padding: '20px',fontFamily: 'helvetica' }}>
                    <Typography variant="h4" gutterBottom style={{ marginBottom: '20px',fontFamily: 'helvetica' }}>
                        Store Management
                    </Typography>
                    <TextField
                        variant="outlined"
                        label="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginBottom: '20px', width: '100%', fontFamily: 'helvetica'}}
                    />
                    <br />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setIsAdding(true)}
                        style={{ marginBottom: '20px' }}
                    >
                        Add Store
                    </Button>
                    <Button
                        variant="contained"
                        onClick={downloadPdf}
                        style={{ marginBottom: '20px', marginLeft: '8px',backgroundColor:"SeaGreen",color:"white" }}	
                    >
                        Download PDF
                    </Button>

                    <TableContainer component={Paper}>
                        <Table >
                            <TableHead>
                                <TableRow >
                                    <TableCell  style={{fontFamily: 'helvetica', fontWeight: 'bold'}}>Store ID</TableCell>
                                    <TableCell style={{fontFamily: 'helvetica', fontWeight: 'bold'}}>Store Name</TableCell>
                                    <TableCell style={{fontFamily: 'helvetica', fontWeight: 'bold'}}>Owner Name</TableCell>
                                    <TableCell style={{fontFamily: 'helvetica', fontWeight: 'bold'}}>Email</TableCell>
                                    <TableCell style={{fontFamily: 'helvetica', fontWeight: 'bold'}}>Phone Number</TableCell>
                                    <TableCell style={{fontFamily: 'helvetica', fontWeight: 'bold'}}>Address</TableCell>
                                    <TableCell style={{fontFamily: 'helvetica', fontWeight: 'bold'}}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStores.map((store) => (
                                    <TableRow key={store._id}>
                                        <TableCell>{store.storeID}</TableCell>
                                        <TableCell>{store.name}</TableCell>
                                        <TableCell>{store.owner_name}</TableCell>
                                        <TableCell>{store.email}</TableCell>
                                        <TableCell>{store.phone_number}</TableCell>
                                        <TableCell>{store.address}</TableCell>
                                        <TableCell>
                                            <Button
                                                onClick={() => handleEditClick(store)}
                                                style={{fontFamily: 'helvetica',fontWeight:"bold", backgroundColor:'gold',color:'black'}}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => deleteStore(store._id)}
                                                style={{ marginLeft: '3px' ,fontFamily: 'helvetica',backgroundColor:'red',fontWeight:"bold",color:"white"}} 
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    

                    {isAdding && (
                        <form style={{ marginTop: '20px',fontFamily: 'helvetica', fontWeight: 'bold' }}>
                            <TextField
                                label="Store ID (SID)"
                                name="storeID"
                                value={storeData.storeID}
                                onChange={handleInputChange}
                                error={!!validationErrors.storeID}
                                helperText={validationErrors.storeID}
                                fullWidth
                                style={{ marginBottom: '20px' }}
                            
                        />
                            <TextField
                                label="Store Name"
                                name="name"
                                value={storeData.name}
                                onChange={handleInputChange}
                                fullWidth
                                style={{ marginBottom: '20px',fontFamily: 'helvetica', fontWeight: 'bold' }}
                            />
                            <TextField
                                label="Owner Name"
                                name="owner_name"
                                value={storeData.owner_name}
                                onChange={handleInputChange}
                                error={!!validationErrors.owner_name}
                                helperText={validationErrors.owner_name}
                                fullWidth
                                style={{ marginBottom: '20px',fontFamily: 'helvetica', fontWeight: 'bold' }}
                            />
                            <TextField
                                label="Email"
                                name="email"
                                value={storeData.email}
                                onChange={handleInputChange}
                                fullWidth
                                style={{ marginBottom: '20px' ,fontFamily: 'helvetica', fontWeight: 'bold'}}
                            />
                            <TextField
                                label="Phone Number"
                                name="phone_number"
                                value={storeData.phone_number}
                                onChange={handleInputChange}
                                error={!!validationErrors.phone_number}
                                helperText={validationErrors.phone_number}
                                fullWidth
                                style={{ marginBottom: '20px' ,fontFamily: 'helvetica', fontWeight: 'bold'}}
                            />
                            <TextField
                                label="Address"
                                name="address"
                                value={storeData.address}
                                onChange={handleInputChange}
                                fullWidth
                                style={{ marginBottom: '20px',fontFamily: 'helvetica', fontWeight: 'bold' }}
                            />

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={selectedStore ? updateStore : addStore}
                            >
                                {selectedStore ? 'Update Store' : 'Add Store'}
                            </Button>
                            <Button
                                variant="contained"
                                onClick={()=>{
                                    resetForm();
                                    setSelectedStore(null); // Clear the selected store
                                }}
                                style={{ marginLeft: '8px',fontFamily: 'helvetica', fontWeight: 'bold',backgroundColor:'Tomato' }}
                            >
                                Reset
                            </Button>
                        </form>
                    )}
                </Container>
            </Box>
        </>
    );
};

export default Store;
