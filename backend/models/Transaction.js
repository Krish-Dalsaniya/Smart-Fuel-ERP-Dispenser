const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dispenser: { type: mongoose.Schema.Types.ObjectId, ref: 'Dispenser' },
  fuelType: { type: String, enum: ['petrol', 'diesel', 'premium'], required: true },
  quantity: { type: Number, required: true }, // liters
  pricePerLiter: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['wallet', 'cash', 'card'], default: 'wallet' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  walletBalanceBefore: { type: Number },
  walletBalanceAfter: { type: Number },
  notes: { type: String },
}, { timestamps: true });

transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
