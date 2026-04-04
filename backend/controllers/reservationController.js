const Reservation = require('../models/Reservation');
const Car = require('../models/Car');

// @desc    Create new reservation
// @route   POST /api/reservations
// @access  Private (Customer)
const createReservation = async (req, res) => {
  const { carId, preferredDate, note } = req.body;

  const car = await Car.findById(carId);
  if (!car) return res.status(404).json({ message: 'Car not found' });

  const reservation = new Reservation({
    customer: req.user._id,
    car: carId,
    preferredDate,
    note
  });

  const createdReservation = await reservation.save();
  res.status(201).json(createdReservation);
};

// @desc    Get logged in user reservations
// @route   GET /api/reservations/my
// @access  Private
const getMyReservations = async (req, res) => {
  const reservations = await Reservation.find({ customer: req.user._id }).populate('car', 'brand model year price');
  res.json(reservations);
};

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private/Admin
const getReservations = async (req, res) => {
  const reservations = await Reservation.find().populate('customer', 'fullName email phone').populate('car', 'brand model');
  res.json(reservations);
};

// @desc    Update reservation status
// @route   PUT /api/reservations/:id/status
// @access  Private/Admin
const updateReservationStatus = async (req, res) => {
  const { status } = req.body;
  const reservation = await Reservation.findById(req.params.id);

  if (reservation) {
    reservation.status = status;
    const updated = await reservation.save();
    res.json(updated);
  } else {
    res.status(404).json({ message: 'Reservation not found' });
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getReservations,
  updateReservationStatus
};
