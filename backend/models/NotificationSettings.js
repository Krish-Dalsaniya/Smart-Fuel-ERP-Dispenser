const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  // User Preferences
  fuelingConfirmation: { type: Boolean, default: true },
  lowBalanceAlert: { type: Boolean, default: true },
  lowBalanceThreshold: { type: Number, default: 500 },
  preferredChannel: { type: String, enum: ['sms', 'whatsapp'], default: 'sms' },
  
  // Admin Preferences
  dispenserOfflineAlert: { type: Boolean, default: true },
  lowStockAlert: { type: Boolean, default: true },
  
  phone: { type: String }, // Can be different from user's primary phone
}, { timestamps: true });

module.exports = mongoose.model('NotificationSettings', notificationSettingsSchema);
