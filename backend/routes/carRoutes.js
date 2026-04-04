const express = require('express');
const router = express.Router();
const { protect, adminGuard } = require('../middleware/authMiddleware');
const {
  getCars, getCarById, createCar, updateCar, deleteCar,
  submitCarListing, getPendingListings, approveListing, rejectListing,
  markAsSold, getMyListings, archiveListing, getAllCarsAdmin, getBrands, getAdminStats
} = require('../controllers/carController');

// Public routes
router.get('/', getCars);
router.get('/brands', getBrands);

// Customer routes
router.post('/submit-listing', protect, submitCarListing);
router.get('/my-listings', protect, getMyListings);
router.put('/:id/archive-listing', protect, archiveListing);

// Admin routes
router.get('/admin/stats', protect, adminGuard, getAdminStats);
router.get('/pending', protect, adminGuard, getPendingListings);
router.get('/admin/all', protect, adminGuard, getAllCarsAdmin);
router.put('/:id/approve', protect, adminGuard, approveListing);
router.put('/:id/reject', protect, adminGuard, rejectListing);
router.put('/:id/mark-sold', protect, adminGuard, markAsSold);

// CRUD (admin)
router.route('/:id')
  .get(getCarById)
  .put(protect, adminGuard, updateCar)
  .delete(protect, adminGuard, deleteCar);

router.post('/', protect, adminGuard, createCar);

module.exports = router;
