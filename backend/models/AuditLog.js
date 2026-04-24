const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  userName: { type: String, required: true },
  role: { type: String, required: true },
  action: { 
    type: String, 
    required: true,
    uppercase: true 
  }, // LOGIN, LOGOUT, CREATE, UPDATE, DELETE, etc.
  module: { 
    type: String, 
    required: true 
  }, // User, Vehicle, Transaction, etc.
  targetId: { type: String }, // ID of the affected resource
  targetName: { type: String }, // Name/Identifier of the affected resource
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexing for faster filtering
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ module: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
