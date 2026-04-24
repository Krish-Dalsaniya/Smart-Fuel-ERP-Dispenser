const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  stationName: { type: String, default: 'Smart Fuel Station' },
  stationAddress: { type: String, default: '123 Energy Way, Industrial Area, Gujarat' },
  stationGSTIN: { type: String, default: '24AAAAA0000A1Z5' },
  stationLogo: { type: String }, // Base64 or URL
  invoiceCounter: { type: Number, default: 1000 }, // Starting point
  lastResetMonth: { type: String }, // e.g. "2026-04"
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
