const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  fuelType: { type: String, enum: ['petrol', 'diesel', 'premium'], required: true, unique: true },
  currentStock: { type: Number, required: true, default: 0 }, // liters
  capacity: { type: Number, required: true }, // max tank capacity
  pricePerLiter: { type: Number, required: true },
  lowStockThreshold: { type: Number, default: 500 },
  reorderLevel: { type: Number, default: 1000 },
  lastRestocked: { type: Date },
  restockHistory: [{
    quantity: Number,
    supplier: String,
    cost: Number,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

inventorySchema.virtual('stockPercentage').get(function() {
  return ((this.currentStock / this.capacity) * 100).toFixed(1);
});

inventorySchema.virtual('isLowStock').get(function() {
  return this.currentStock <= this.lowStockThreshold;
});

module.exports = mongoose.model('Inventory', inventorySchema);
