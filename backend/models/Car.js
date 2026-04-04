const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  // Inventory type
  category: { type: String, enum: ['new', 'used'], required: true },

  // Core details
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  minimumPrice: { type: Number }, // Auto-calculated: price * 0.9 for negotiation floor
  mileage: { type: Number, default: 0 },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], required: true },
  transmission: { type: String, enum: ['Automatic', 'Manual'], required: true },
  bodyType: { type: String, enum: ['Sedan', 'SUV', 'Crossover', 'Hatchback', 'Coupe', 'Convertible', 'Fastback', 'Gran Coupe', 'Roadster', 'Full-size SUV', 'Coupe SUV', 'Off-road SUV'], required: true },

  // Description
  overview: { type: String, default: '' },

  // Images (Cloudinary URLs)
  images: [{ type: String }],
  mainImageIndex: { type: Number, default: 0 },

  // Listing info (for customer-submitted used cars)
  listedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  listingStatus: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
  rejectionReason: { type: String, default: '' },
  sellerArchivedAt: { type: Date, default: null },

  // Car lifecycle
  status: { type: String, enum: ['available', 'reserved', 'sold', 'hidden'], default: 'available' }
}, { timestamps: true });

// Auto-calculate minimum negotiation price before saving
carSchema.pre('save', function() {
  if (this.isModified('price')) {
    this.minimumPrice = Math.floor(this.price * 0.9);
  }
});

module.exports = mongoose.model('Car', carSchema);
