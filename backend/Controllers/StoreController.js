const Store = require('../Model/StoreModel'); // Adjust the path as needed

// Create a new store
exports.createStore = async (req, res) => {
    try {
        const { storeID, name, owner_name, email, phone_number, address } = req.body; // Added owner_name to request body

        const newStore = new Store({ storeID, name, owner_name, email, phone_number, address }); // Added owner_name to Store object
        await newStore.save();
        
        res.status(201).json({ message: 'Store created successfully', store: newStore });
    } catch (error) {
        res.status(500).json({ message: 'Error creating store', error: error.message });
    }
};

// Get all stores
exports.getAllStores = async (req, res) => {
    try {
        const stores = await Store.find();
        console.log("Fetched stores:", stores); // Log fetched data for debugging
        res.status(200).json(stores);
    } catch (error) {
        console.error("Error retrieving stores:", error.message);
        res.status(500).json({ message: 'Error retrieving stores', error: error.message });
    }
};

// Get a single store by ID
exports.getStoreById = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.status(200).json(store);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving store', error: error.message });
    }
};

// Update a store by ID
exports.updateStore = async (req, res) => {
    try {
        const { name, owner_name, email, phone_number, address } = req.body; // Added owner_name to update body
        const updatedStore = await Store.findByIdAndUpdate(
            req.params.id,
            { name, owner_name, email, phone_number, address }, // Updated with owner_name
            { new: true } // Return the updated store
        );
        
        if (!updatedStore) {
            return res.status(404).json({ message: 'Store not found' });
        }
        
        res.status(200).json({ message: 'Store updated successfully', store: updatedStore });
    } catch (error) {
        res.status(500).json({ message: 'Error updating store', error: error.message });
    }
};

// Delete a store by ID
exports.deleteStore = async (req, res) => {
    try {
        const deletedStore = await Store.findByIdAndDelete(req.params.id);
        if (!deletedStore) {
            return res.status(404).json({ message: 'Store not found' });
        }
        
        res.status(200).json({ message: 'Store deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting store', error: error.message });
    }
};
