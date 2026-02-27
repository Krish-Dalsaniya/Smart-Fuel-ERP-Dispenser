const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Vehicle = require('../models/Vehicle');
const Inventory = require('../models/Inventory');
const { protect, authorize } = require('../middleware/auth');

// GET all transactions
router.get('/', protect, authorize('admin', 'operator'), async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate, fuelType, paymentStatus, vehicle } = req.query;
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (fuelType) query.fuelType = fuelType;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (vehicle) query.vehicle = vehicle;
    const transactions = await Transaction.find(query)
      .populate('vehicle', 'plateNumber make model fuelType')
      .populate('operator', 'name')
      .populate('dispenser', 'dispenserId name')
      .skip((page - 1) * limit).limit(+limit).sort('-createdAt');
    const total = await Transaction.countDocuments(query);
    res.json({ success: true, data: transactions, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET own transactions
router.get('/my', protect, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id }).select('_id');
    const vehicleIds = vehicles.map(v => v._id);
    const transactions = await Transaction.find({ vehicle: { $in: vehicleIds } })
      .populate('vehicle', 'plateNumber make model')
      .sort('-createdAt').limit(50);
    res.json({ success: true, data: transactions });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST create transaction (fuel dispensing)
router.post('/', protect, authorize('admin', 'operator'), async (req, res) => {
  try {
    const { vehicleId, fuelType, quantity, paymentMethod = 'wallet', notes } = req.body;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    const inventory = await Inventory.findOne({ fuelType });
    if (!inventory) return res.status(404).json({ success: false, message: 'Inventory not found for fuel type' });
    if (inventory.currentStock < quantity) return res.status(400).json({ success: false, message: 'Insufficient fuel stock' });

    const totalAmount = quantity * inventory.pricePerLiter;

    if (paymentMethod === 'wallet') {
      if (vehicle.walletBalance < totalAmount) {
        return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
      }
    }

    const walletBalanceBefore = vehicle.walletBalance;
    if (paymentMethod === 'wallet') vehicle.walletBalance -= totalAmount;
    vehicle.totalFuelConsumed += quantity;
    vehicle.totalSpent += totalAmount;
    await vehicle.save();

    inventory.currentStock -= quantity;
    await inventory.save();

    const transaction = await Transaction.create({
      vehicle: vehicleId,
      operator: req.user._id,
      fuelType,
      quantity,
      pricePerLiter: inventory.pricePerLiter,
      totalAmount,
      paymentMethod,
      paymentStatus: 'completed',
      walletBalanceBefore,
      walletBalanceAfter: vehicle.walletBalance,
      notes
    });

    await transaction.populate('vehicle', 'plateNumber make model');
    res.status(201).json({ success: true, data: transaction });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET transaction by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('vehicle', 'plateNumber make model owner')
      .populate('operator', 'name email')
      .populate('dispenser', 'dispenserId name');
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, data: transaction });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
