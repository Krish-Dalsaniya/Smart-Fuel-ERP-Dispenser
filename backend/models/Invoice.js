const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  customerGSTIN: { type: String },
  
  stationName: { type: String, required: true },
  stationGSTIN: { type: String, required: true },
  stationAddress: { type: String, required: true },
  
  fuelType: { type: String, required: true },
  quantity: { type: Number, required: true },
  ratePerLitre: { type: Number, required: true },
  baseAmount: { type: Number, required: true },
  
  cgstRate: { type: Number, default: 9 }, // 9%
  sgstRate: { type: Number, default: 9 }, // 9%
  cgstAmount: { type: Number, required: true },
  sgstAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  
  paymentMethod: { type: String },
  status: { type: String, enum: ['generated', 'sent'], default: 'generated' },
  pdfPath: { type: String }, // Path to stored PDF if we save it, or just generate on fly
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
