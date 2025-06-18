const express = require('express');
const router = express.Router();
const storeController = require('../Controllers/StoreController'); // Adjust the path as needed

// Route to create a new store
router.post('/', storeController.createStore);

// Route to get all stores
router.get('/', storeController.getAllStores);

// Route to get a single store by ID
router.get('/:id', storeController.getStoreById);

// Route to update a store by ID
router.put('/:id', storeController.updateStore);

// Route to delete a store by ID
router.delete('/:id', storeController.deleteStore);

module.exports = router;
