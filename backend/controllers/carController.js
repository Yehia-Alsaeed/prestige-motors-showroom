const Car = require('../models/Car');
const Offer = require('../models/Offer');
const Reservation = require('../models/Reservation');

// @desc    Get all cars (public, filters by category/status)
// @route   GET /api/cars
// @access  Public
const getCars = async (req, res) => {
  const filter = { listingStatus: 'approved', status: 'available' };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.brand) filter.brand = req.query.brand;
  if (req.query.bodyType) filter.bodyType = req.query.bodyType;
  if (req.query.fuelType) filter.fuelType = req.query.fuelType;
  if (req.query.transmission) filter.transmission = req.query.transmission;
  
  const cars = await Car.find(filter).sort({ createdAt: -1 });
  res.json(cars);
};

// @desc    Get car by ID
// @route   GET /api/cars/:id
// @access  Public
const getCarById = async (req, res) => {
  const car = await Car.findById(req.params.id).populate('listedBy', 'firstName lastName');
  if (car) {
    res.json(car);
  } else {
    res.status(404).json({ message: 'Car not found' });
  }
};

// @desc    Create a car (admin only)
// @route   POST /api/cars
// @access  Private/Admin
const createCar = async (req, res) => {
  const car = new Car({ ...req.body, listingStatus: 'approved' });
  const createdCar = await car.save();
  res.status(201).json(createdCar);
};

// @desc    Customer submits a used car listing for approval
// @route   POST /api/cars/submit-listing
// @access  Private
const submitCarListing = async (req, res) => {
  const { brand, model, year, price, mileage, fuelType, transmission, bodyType, overview, images } = req.body;

  if (!brand || !model || !year || !price || !mileage || !fuelType || !transmission || !bodyType || !overview) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  if (!images || images.length < 3 || images.length > 6) {
    return res.status(400).json({ message: 'Please upload between 3 and 6 photos' });
  }

  const car = await Car.create({
    category: 'used',
    brand, model, year, price, mileage, fuelType, transmission, bodyType, overview, images,
    listedBy: req.user._id,
    listingStatus: 'pending',
    status: 'available'
  });

  res.status(201).json(car);
};

// @desc    Get pending listings (admin only)
// @route   GET /api/cars/pending
// @access  Private/Admin
const getPendingListings = async (req, res) => {
  const cars = await Car.find({ listingStatus: 'pending' }).populate('listedBy', 'firstName lastName email');
  res.json(cars);
};

// @desc    Approve a listing (admin only)
// @route   PUT /api/cars/:id/approve
// @access  Private/Admin
const approveListing = async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (car) {
    car.listingStatus = 'approved';
    await car.save();
    res.json({ message: 'Listing approved', car });
  } else {
    res.status(404).json({ message: 'Car not found' });
  }
};

// @desc    Reject a listing (admin only)
// @route   PUT /api/cars/:id/reject
// @access  Private/Admin  
const rejectListing = async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (car) {
    car.listingStatus = 'rejected';
    car.rejectionReason = req.body.reason || 'No specific reason provided';
    await car.save();
    res.json({ message: 'Listing rejected with reason', car });
  } else {
    res.status(404).json({ message: 'Car not found' });
  }
};

// @desc    Mark car as sold (admin only)
// @route   PUT /api/cars/:id/mark-sold
// @access  Private/Admin
const markAsSold = async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (car) {
    car.status = 'sold';
    await car.save();
    res.json({ message: 'Car marked as sold', car });
  } else {
    res.status(404).json({ message: 'Car not found' });
  }
};

// @desc    Update a car (admin only)
// @route   PUT /api/cars/:id
// @access  Private/Admin
const updateCar = async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (car) {
    Object.assign(car, req.body);
    const updatedCar = await car.save();
    res.json(updatedCar);
  } else {
    res.status(404).json({ message: 'Car not found' });
  }
};

// @desc    Delete a car (admin only)
// @route   DELETE /api/cars/:id
// @access  Private/Admin
const deleteCar = async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (car) {
    await Promise.all([
      Offer.deleteMany({ car: car._id }),
      Reservation.deleteMany({ car: car._id })
    ]);
    await car.deleteOne();
    res.json({ message: 'Car and related records removed' });
  } else {
    res.status(404).json({ message: 'Car not found' });
  }
};

// @desc    Get cars listed by the current user
// @route   GET /api/cars/my-listings
// @access  Private
const getMyListings = async (req, res) => {
  const cars = await Car.find({ listedBy: req.user._id, sellerArchivedAt: null });
  res.json(cars);
};

// @desc    Archive a seller listing from the dashboard
// @route   PUT /api/cars/:id/archive-listing
// @access  Private
const archiveListing = async (req, res) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    return res.status(404).json({ message: 'Car not found' });
  }

  if (!car.listedBy || String(car.listedBy) !== String(req.user._id)) {
    return res.status(403).json({ message: 'You can only dismiss your own listings' });
  }

  const canArchive = car.listingStatus === 'rejected' || ['reserved', 'sold', 'hidden'].includes(car.status);
  if (!canArchive) {
    return res.status(400).json({ message: 'This listing is still active and cannot be dismissed yet' });
  }

  car.sellerArchivedAt = new Date();
  await car.save();

  res.json({ message: 'Listing dismissed from your dashboard' });
};

// @desc    Get all cars for admin (all statuses)
// @route   GET /api/cars/admin/all
// @access  Private/Admin
const getAllCarsAdmin = async (req, res) => {
  const cars = await Car.find({}).populate('listedBy', 'firstName lastName email').sort({ createdAt: -1 });
  res.json(cars);
};

// @desc    Get distinct brands for filter dropdowns
// @route   GET /api/cars/brands
// @access  Public
const getBrands = async (req, res) => {
  const brands = await Car.distinct('brand', { listingStatus: 'approved', status: 'available' });
  res.json(brands.sort());
};

// @desc    Get stats for admin dashboard
// @route   GET /api/cars/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  const User = require('../models/User');
  
  const totalCars = await Car.countDocuments();
  const availableCars = await Car.countDocuments({ status: 'available' });
  const soldCars = await Car.countDocuments({ status: 'sold' });
  const pendingListings = await Car.countDocuments({ listingStatus: 'pending' });
  
  const totalReservations = await Offer.countDocuments();
  const pendingReservations = await Offer.countDocuments({ status: 'pending' });
  const reservedOffers = await Offer.countDocuments({ status: 'accepted', reservationStatus: 'reserved' });
  
  const totalUsers = await User.countDocuments({ role: 'customer' });
  
  // Estimate pipeline based on pending offers
  const pendingOffers = await Offer.find({ status: 'pending' });
  const pipelineValue = pendingOffers.reduce((sum, offer) => sum + offer.offerPrice, 0);

  // Closed pipeline is based on confirmed sold transactions.
  const soldOffers = await Offer.find({
    status: 'accepted',
    reservationStatus: 'sold',
    car: { $ne: null }
  }).select('car offerPrice');

  const soldOfferCarIds = soldOffers
    .map((offer) => offer.car)
    .filter(Boolean);

  const directSoldCars = await Car.find({
    status: 'sold',
    _id: { $nin: soldOfferCarIds }
  }).select('price');

  const soldPipelineValue =
    soldOffers.reduce((sum, offer) => sum + offer.offerPrice, 0) +
    directSoldCars.reduce((sum, car) => sum + car.price, 0);

  const soldTransactions = soldOffers.length + directSoldCars.length;

  res.json({
    cars: { total: totalCars, available: availableCars, sold: soldCars, pendingListings },
    reservations: { total: totalReservations, pending: pendingReservations, reserved: reservedOffers },
    users: { total: totalUsers },
    pipeline: {
      pending: pipelineValue,
      sold: soldPipelineValue,
      soldTransactions
    }
  });
};

module.exports = {
  getCars, getCarById, createCar, updateCar, deleteCar,
  submitCarListing, getPendingListings, approveListing, rejectListing,
  markAsSold, getMyListings, archiveListing, getAllCarsAdmin, getBrands, getAdminStats
};
