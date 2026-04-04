const express = require('express');
const router = express.Router();
const { createReservation, getMyReservations, getReservations, updateReservationStatus } = require('../controllers/reservationController');
const { protect, adminGuard } = require('../middleware/authMiddleware');

const rateLimit = require('express-rate-limit');
const reservationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  handler: (req, res, next, options) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    console.log(`[SECURITY] [${new Date().toISOString()}] 429 POST ${req.originalUrl} - IP: ${ip} - Reason: Rate limit exceeded`);
    res.status(options.statusCode).json(options.message);
  },
  message: { message: 'Too many reservations submitted from this IP, please try again in 15 minutes' }
});

router.route('/')
  .post(protect, reservationLimiter, createReservation)
  .get(protect, adminGuard, getReservations);

router.get('/my', protect, getMyReservations);
router.put('/:id/status', protect, adminGuard, updateReservationStatus);

module.exports = router;
