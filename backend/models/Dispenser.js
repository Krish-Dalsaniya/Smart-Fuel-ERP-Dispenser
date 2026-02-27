const mongoose = require('mongoose');

const dispenserSchema = new mongoose.Schema({
  dispenserId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  fuelType: { type: String, enum: ['petrol', 'diesel', 'premium'], required: true },
  status: { type: String, enum: ['idle', 'active', 'maintenance', 'offline'], default: 'idle' },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalDispensed: { type: Number, default: 0 },
  lastServiceDate: { type: Date },
  location: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Dispenser', dispenserSchema);
