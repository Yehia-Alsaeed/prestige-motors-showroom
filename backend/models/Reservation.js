const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  preferredDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'], default: 'pending' },
  note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
