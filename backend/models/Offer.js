const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offerPrice: { type: Number, required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  sellerDecision: { type: String, enum: ['not_required', 'pending', 'accepted', 'rejected'], default: 'not_required' },
  sellerDecisionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sellerDecisionAt: { type: Date, default: null },
  decisionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  decisionByRole: { type: String, enum: ['seller', 'admin'], default: null },
  reservationStatus: { type: String, enum: ['none', 'reserved', 'sold', 'relisted'], default: 'none' },
  sellerNotifiedAt: { type: Date, default: null },
  sellerViewedAt: { type: Date, default: null },
  buyerUpdatedAt: { type: Date, default: Date.now },
  adminViewedAt: { type: Date, default: null },
  revisionCount: { type: Number, default: 0 },
  respondedAt: { type: Date, default: null },
  buyerArchivedAt: { type: Date, default: null },
  sellerArchivedAt: { type: Date, default: null },
  adminArchivedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
