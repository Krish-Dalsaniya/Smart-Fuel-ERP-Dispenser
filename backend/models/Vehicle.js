const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true, uppercase: true },
  rfidTag: { type: String, unique: true, sparse: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number },
  fuelType: { type: String, enum: ['petrol', 'diesel', 'premium', 'electric'], default: 'petrol' },
  tankCapacity: { type: Number }, // in liters
  isActive: { type: Boolean, default: true },
  walletBalance: { type: Number, default: 0 },
  totalFuelConsumed: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
