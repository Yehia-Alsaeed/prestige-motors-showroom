const express = require('express');
const router = express.Router();
const { protect, adminGuard } = require('../middleware/authMiddleware');
const {
  createOffer, getMyOffers, getIncomingOffers, getOffersForCar,
  acceptOffer, rejectOffer, respondToOfferAsSeller, confirmSold, displayAgain,
  archiveOfferForBuyer, archiveOfferForSeller, archiveOfferForAdmin, getAllOffers
} = require('../controllers/offerController');

const rateLimit = require('express-rate-limit');
const offerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  handler: (req, res, next, options) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    console.log(`[SECURITY] [${new Date().toISOString()}] 429 POST ${req.originalUrl} - IP: ${ip} - Reason: Rate limit exceeded`);
    res.status(options.statusCode).json(options.message);
  },
  message: { message: 'Too many offers submitted from this IP, please try again in 15 minutes' }
});

router.post('/', protect, offerLimiter, createOffer);
router.get('/my', protect, getMyOffers);
router.get('/incoming', protect, getIncomingOffers);
router.get('/all', protect, adminGuard, getAllOffers);
router.get('/car/:carId', protect, adminGuard, getOffersForCar);
router.put('/:id/archive/buyer', protect, archiveOfferForBuyer);
router.put('/:id/archive/seller', protect, archiveOfferForSeller);
router.put('/:id/archive/admin', protect, adminGuard, archiveOfferForAdmin);
router.put('/:id/seller-response', protect, respondToOfferAsSeller);
router.put('/:id/accept', protect, adminGuard, acceptOffer);
router.put('/:id/reject', protect, adminGuard, rejectOffer);
router.put('/:id/confirm-sold', protect, adminGuard, confirmSold);
router.put('/:id/display-again', protect, adminGuard, displayAgain);

module.exports = router;
