const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  phone: { type: String, required: true },
  channel: { type: String, enum: ['sms', 'whatsapp'], required: true },
  type: { 
    type: String, 
    enum: ['transaction', 'low_balance', 'dispenser_offline', 'low_stock'], 
    required: true 
  },
  message: { type: String, required: true },
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  twilioSid: { type: String },
  error: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
