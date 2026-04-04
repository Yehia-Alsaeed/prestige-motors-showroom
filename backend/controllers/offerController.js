const Offer = require('../models/Offer');
const Car = require('../models/Car');

const populateOfferDetails = (query) => query
  .populate({
    path: 'car',
    select: 'brand model year price images mainImageIndex category listedBy status',
    populate: { path: 'listedBy', select: 'firstName lastName email phone' }
  })
  .populate('buyer', 'firstName lastName email phone')
  .populate('sellerDecisionBy', 'firstName lastName email role')
  .populate('decisionBy', 'firstName lastName email role');

const populateSellerOfferDetails = (query) => query
  .populate({
    path: 'car',
    select: 'brand model year price images mainImageIndex category listedBy status'
  })
  .populate('sellerDecisionBy', 'firstName lastName email role')
  .populate('decisionBy', 'firstName lastName email role');

const getSellerDecisionState = (offer) => {
  if (offer.sellerDecision) return offer.sellerDecision;
  return offer.car?.listedBy ? 'pending' : 'not_required';
};

const isNegotiationOffer = (offer) => {
  const askingPrice = offer.car?.price ?? offer.carPriceSnapshot;
  return typeof askingPrice === 'number' && offer.offerPrice < askingPrice;
};

const rejectCompetingOffers = async ({ offer, actedBy, respondedAt }) => {
  const carId = offer.car?._id || offer.car;

  await Offer.updateMany(
    { car: carId, _id: { $ne: offer._id }, status: 'pending' },
    {
      status: 'rejected',
      decisionBy: actedBy._id,
      decisionByRole: 'admin',
      respondedAt,
      reservationStatus: 'none'
    }
  );
};

const finalizeAdminDecision = async ({ offer, actedBy, status }) => {
  if (offer.status !== 'pending') {
    return { error: `Offer has already been ${offer.status}` };
  }

  const sellerDecision = getSellerDecisionState(offer);
  const carId = offer.car?._id || offer.car;
  const respondedAt = new Date();

  if (status === 'accepted' && offer.car?.listedBy && sellerDecision !== 'accepted' && sellerDecision !== 'not_required') {
    return { error: 'Seller must accept the negotiated price before admin can reserve this car' };
  }

  if (status === 'accepted' && offer.car?.status && offer.car.status !== 'available') {
    return { error: `Car is already ${offer.car.status}` };
  }

  offer.status = status;
  offer.decisionBy = actedBy._id;
  offer.decisionByRole = 'admin';
  offer.respondedAt = respondedAt;
  offer.reservationStatus = status === 'accepted' ? 'reserved' : 'none';

  await offer.save();

  if (status === 'accepted') {
    await rejectCompetingOffers({ offer, actedBy, respondedAt });
    await Car.findByIdAndUpdate(carId, { status: 'reserved' });
  }

  return { offer };
};

const canBuyerArchive = (offer) => {
  if (offer.status === 'rejected') return true;
  return ['sold', 'relisted'].includes(offer.reservationStatus);
};

const canSellerArchive = (offer) => offer.status !== 'pending';

const canAdminArchive = (offer) => offer.status === 'rejected' || ['sold', 'relisted'].includes(offer.reservationStatus);

const offerSort = { buyerUpdatedAt: -1, updatedAt: -1, createdAt: -1 };

const resetOfferForSubmission = ({ offer, car, offerPrice, message, isNegotiation, isUpdate }) => {
  const submittedAt = new Date();

  offer.offerPrice = offerPrice;
  offer.message = message || '';
  offer.status = 'pending';
  offer.sellerDecision = isNegotiation ? 'pending' : 'not_required';
  offer.sellerDecisionBy = null;
  offer.sellerDecisionAt = null;
  offer.decisionBy = null;
  offer.decisionByRole = null;
  offer.reservationStatus = 'none';
  offer.sellerNotifiedAt = isNegotiation ? submittedAt : null;
  offer.sellerViewedAt = null;
  offer.buyerUpdatedAt = submittedAt;
  offer.adminViewedAt = null;
  offer.respondedAt = null;
  offer.buyerArchivedAt = null;
  offer.sellerArchivedAt = null;
  offer.adminArchivedAt = null;

  if (isUpdate) {
    offer.revisionCount = (offer.revisionCount || 0) + 1;
  } else {
    offer.revisionCount = 0;
  }

  return offer;
};

const mapAdminOffer = (offer) => {
  const plainOffer = offer.toObject();
  const buyerUpdatedAt = plainOffer.buyerUpdatedAt || plainOffer.updatedAt || plainOffer.createdAt;
  const adminViewedAt = plainOffer.adminViewedAt;

  plainOffer.wasUpdated = (plainOffer.revisionCount || 0) > 0;
  plainOffer.needsAdminReview = !adminViewedAt || new Date(adminViewedAt).getTime() < new Date(buyerUpdatedAt).getTime();

  return plainOffer;
};

const getOfferThreadKey = (offer) => {
  const carId = String(offer.car?._id || offer.car);
  const buyerId = String(offer.buyer?._id || offer.buyer);
  return `${carId}:${buyerId}`;
};

const dedupeLatestOffers = (offers) => {
  const seen = new Set();

  return offers.filter((offer) => {
    const threadKey = getOfferThreadKey(offer);
    if (seen.has(threadKey)) {
      return false;
    }

    seen.add(threadKey);
    return true;
  });
};

// @desc    Make an offer on a used car or submit a showroom reservation
// @route   POST /api/offers
// @access  Private
const createOffer = async (req, res) => {
  const { carId, offerPrice, message } = req.body;

  const car = await Car.findById(carId);
  if (!car) return res.status(404).json({ message: 'Car not found' });
  if (car.status !== 'available') return res.status(400).json({ message: 'This car is no longer available' });
  if (car.listedBy && String(car.listedBy) === String(req.user._id)) {
    return res.status(400).json({ message: 'You cannot make an offer on your own listing' });
  }

  if (car.category === 'new' && offerPrice !== car.price) {
    return res.status(400).json({ message: 'Showroom cars can only be reserved at the listed price' });
  }

  if (car.category === 'used' && offerPrice < car.minimumPrice) {
    return res.status(400).json({
      message: `Offer must be at least ${car.minimumPrice.toLocaleString()} EGP (90% of asking price)`
    });
  }

  if (offerPrice > car.price) {
    return res.status(400).json({ message: 'Offer cannot exceed the asking price' });
  }

  const isNegotiation = Boolean(car.listedBy) && offerPrice < car.price;
  const isReservation = car.category === 'new';
  let offer = await Offer.findOne({ car: carId, buyer: req.user._id }).sort(offerSort);

  if (offer) {
    resetOfferForSubmission({
      offer,
      car,
      offerPrice,
      message,
      isNegotiation,
      isUpdate: true
    });

    await offer.save();
    return res.json({ message: isReservation ? 'Reservation updated' : 'Offer updated', offer });
  }

  offer = new Offer({
    car: carId,
    buyer: req.user._id
  });

  resetOfferForSubmission({
    offer,
    car,
    offerPrice,
    message,
    isNegotiation,
    isUpdate: false
  });

  await offer.save();

  res.status(201).json({ message: isReservation ? 'Reservation submitted' : 'Offer submitted', offer });
};

// @desc    Get offers for the current buyer
// @route   GET /api/offers/my
// @access  Private
const getMyOffers = async (req, res) => {
  const offers = await populateOfferDetails(
    Offer.find({ buyer: req.user._id, buyerArchivedAt: null }).sort(offerSort)
  );
  res.json(dedupeLatestOffers(offers));
};

// @desc    Get incoming offers for the seller's listed cars
// @route   GET /api/offers/incoming
// @access  Private
const getIncomingOffers = async (req, res) => {
  const sellerCars = await Car.find({ listedBy: req.user._id }).select('_id');
  const carIds = sellerCars.map((car) => car._id);

  if (carIds.length === 0) {
    return res.json([]);
  }

  const unseenOfferIds = await Offer.find({
    car: { $in: carIds },
    sellerArchivedAt: null,
    sellerDecision: { $ne: 'not_required' },
    sellerNotifiedAt: { $ne: null },
    sellerViewedAt: null
  }).distinct('_id');

  if (unseenOfferIds.length > 0) {
    await Offer.updateMany(
      { _id: { $in: unseenOfferIds } },
      { sellerViewedAt: new Date() }
    );
  }

  const offers = await populateSellerOfferDetails(
    Offer.find({
      car: { $in: carIds },
      sellerArchivedAt: null,
      sellerDecision: { $ne: 'not_required' }
    }).sort(offerSort)
  );

  res.json(dedupeLatestOffers(offers).map((offer) => {
    const safeOffer = offer.toObject();
    delete safeOffer.buyer;
    delete safeOffer.message;
    return safeOffer;
  }));
};

// @desc    Get all offers on a specific car
// @route   GET /api/offers/car/:carId
// @access  Private/Admin
const getOffersForCar = async (req, res) => {
  const offers = await populateOfferDetails(
    Offer.find({ car: req.params.carId }).sort(offerSort)
  );
  res.json(dedupeLatestOffers(offers));
};

// @desc    Accept an offer (admin only)
// @route   PUT /api/offers/:id/accept
// @access  Private/Admin
const acceptOffer = async (req, res) => {
  const offer = await Offer.findById(req.params.id).populate('car', 'listedBy status');
  if (!offer) return res.status(404).json({ message: 'Offer not found' });

  const result = await finalizeAdminDecision({
    offer,
    actedBy: req.user,
    status: 'accepted'
  });

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  res.json({ message: 'Offer accepted by admin and car reserved', offer: result.offer });
};

// @desc    Reject an offer (admin only)
// @route   PUT /api/offers/:id/reject
// @access  Private/Admin
const rejectOffer = async (req, res) => {
  const offer = await Offer.findById(req.params.id).populate('car', 'listedBy status');
  if (!offer) return res.status(404).json({ message: 'Offer not found' });

  const result = await finalizeAdminDecision({
    offer,
    actedBy: req.user,
    status: 'rejected'
  });

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  res.json({ message: 'Offer rejected by admin', offer: result.offer });
};

// @desc    Seller responds to an incoming offer on their listing
// @route   PUT /api/offers/:id/seller-response
// @access  Private
const respondToOfferAsSeller = async (req, res) => {
  const { action } = req.body;

  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Action must be accept or reject' });
  }

  const offer = await Offer.findById(req.params.id).populate({
    path: 'car',
    select: 'listedBy price'
  });
  if (!offer) return res.status(404).json({ message: 'Offer not found' });

  if (!offer.car?.listedBy || String(offer.car.listedBy) !== String(req.user._id)) {
    return res.status(403).json({ message: 'You can only respond to offers on your own listings' });
  }

  if (!isNegotiationOffer(offer)) {
    return res.status(400).json({ message: 'Seller approval is only needed for negotiated prices' });
  }

  if (offer.status !== 'pending') {
    return res.status(400).json({ message: `Offer has already been ${offer.status}` });
  }

  if (getSellerDecisionState(offer) !== 'pending') {
    return res.status(400).json({ message: 'Seller has already responded to this price request' });
  }

  const respondedAt = new Date();
  offer.sellerViewedAt = offer.sellerViewedAt || respondedAt;
  offer.sellerDecision = action === 'accept' ? 'accepted' : 'rejected';
  offer.sellerDecisionBy = req.user._id;
  offer.sellerDecisionAt = respondedAt;

  if (action === 'reject') {
    offer.status = 'rejected';
    offer.decisionBy = req.user._id;
    offer.decisionByRole = 'seller';
    offer.respondedAt = respondedAt;
  }

  await offer.save();

  res.json({
    message: action === 'accept'
      ? 'Seller accepted the negotiated price. Awaiting admin confirmation.'
      : 'Offer rejected by seller',
    offer
  });
};

// @desc    Confirm a reserved car as sold (admin only)
// @route   PUT /api/offers/:id/confirm-sold
// @access  Private/Admin
const confirmSold = async (req, res) => {
  const offer = await Offer.findById(req.params.id).populate('car', 'status');
  if (!offer) return res.status(404).json({ message: 'Offer not found' });

  if (offer.status !== 'accepted' || offer.reservationStatus !== 'reserved') {
    return res.status(400).json({ message: 'Only reserved offers can be marked as sold' });
  }

  offer.reservationStatus = 'sold';
  await offer.save();

  await Car.findByIdAndUpdate(offer.car._id || offer.car, { status: 'sold' });

  res.json({ message: 'Sale confirmed', offer });
};

// @desc    Return a reserved car back to inventory (admin only)
// @route   PUT /api/offers/:id/display-again
// @access  Private/Admin
const displayAgain = async (req, res) => {
  const offer = await Offer.findById(req.params.id).populate('car', 'status');
  if (!offer) return res.status(404).json({ message: 'Offer not found' });

  if (offer.status !== 'accepted' || offer.reservationStatus !== 'reserved') {
    return res.status(400).json({ message: 'Only reserved offers can be returned to inventory' });
  }

  offer.reservationStatus = 'relisted';
  await offer.save();

  await Car.findByIdAndUpdate(offer.car._id || offer.car, { status: 'available' });

  res.json({ message: 'Car returned to inventory', offer });
};

// @desc    Archive an offer from the buyer dashboard
// @route   PUT /api/offers/:id/archive/buyer
// @access  Private
const archiveOfferForBuyer = async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) return res.status(404).json({ message: 'Offer not found' });
  if (String(offer.buyer) !== String(req.user._id)) {
    return res.status(403).json({ message: 'You can only archive your own offers' });
  }
  if (!canBuyerArchive(offer)) {
    return res.status(400).json({ message: 'This item is still active and cannot be dismissed yet' });
  }

  offer.buyerArchivedAt = new Date();
  await offer.save();
  res.json({ message: 'Item dismissed from your dashboard' });
};

// @desc    Archive an offer from the seller dashboard
// @route   PUT /api/offers/:id/archive/seller
// @access  Private
const archiveOfferForSeller = async (req, res) => {
  const offer = await Offer.findById(req.params.id).populate('car', 'listedBy');
  if (!offer) return res.status(404).json({ message: 'Offer not found' });
  if (!offer.car?.listedBy || String(offer.car.listedBy) !== String(req.user._id)) {
    return res.status(403).json({ message: 'You can only archive offers from your own listings' });
  }
  if (!canSellerArchive(offer)) {
    return res.status(400).json({ message: 'This price request still needs action' });
  }

  offer.sellerArchivedAt = new Date();
  await offer.save();
  res.json({ message: 'Item dismissed from seller notifications' });
};

// @desc    Archive an offer from the admin dashboard
// @route   PUT /api/offers/:id/archive/admin
// @access  Private/Admin
const archiveOfferForAdmin = async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) return res.status(404).json({ message: 'Offer not found' });
  if (!canAdminArchive(offer)) {
    return res.status(400).json({ message: 'This reservation still needs admin follow-up' });
  }

  offer.adminArchivedAt = new Date();
  await offer.save();
  res.json({ message: 'Item dismissed from admin reservations' });
};

// @desc    Get all offers (admin)
// @route   GET /api/offers/all
// @access  Private/Admin
const getAllOffers = async (req, res) => {
  const offers = await populateOfferDetails(
    Offer.find({ adminArchivedAt: null }).sort(offerSort)
  );

  const responseOffers = dedupeLatestOffers(offers).map(mapAdminOffer);
  const unseenOfferIds = responseOffers
    .filter((offer) => offer.needsAdminReview)
    .map((offer) => offer._id);

  if (unseenOfferIds.length > 0) {
    await Offer.updateMany(
      { _id: { $in: unseenOfferIds } },
      { adminViewedAt: new Date() }
    );
  }

  res.json(responseOffers);
};

module.exports = {
  createOffer,
  getMyOffers,
  getIncomingOffers,
  getOffersForCar,
  acceptOffer,
  rejectOffer,
  respondToOfferAsSeller,
  confirmSold,
  displayAgain,
  archiveOfferForBuyer,
  archiveOfferForSeller,
  archiveOfferForAdmin,
  getAllOffers
};
