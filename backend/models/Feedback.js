const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  rating: { type: Number, min: 1, max: 5, required: true },
  category: { type: String, enum: ['service', 'fuel_quality', 'pricing', 'general'], default: 'general' },
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'reviewed', 'resolved'], default: 'open' },
  adminResponse: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
