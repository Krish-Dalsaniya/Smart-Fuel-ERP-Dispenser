const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  operator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  operatorName: { type: String, required: true },
  dispenser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Dispenser', 
    required: true 
  },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'closed'], 
    default: 'active' 
  },
  openingCash: { type: Number, default: 0 },
  closingCash: { type: Number, default: 0 },
  
  // Aggregated data (calculated on shift end)
  totalTransactions: { type: Number, default: 0 },
  totalVolumeLitres: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  fuelBreakdown: [{
    fuelType: String,
    litres: Number,
    revenue: Number
  }],
  
  notes: { type: String }
}, { timestamps: true });

// Indexing for performance
shiftSchema.index({ operator: 1, startTime: -1 });
shiftSchema.index({ status: 1 });

module.exports = mongoose.model('Shift', shiftSchema);
