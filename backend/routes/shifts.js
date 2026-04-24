const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');
const Transaction = require('../models/Transaction');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/audit');

// @route   POST /api/shifts/start
// @desc    Start a new shift
router.post('/start', protect, logActivity('START_SHIFT', 'Shift'), async (req, res) => {
  try {
    const { dispenserId, openingCash, notes } = req.body;
    
    // Check if operator already has an active shift
    const activeShift = await Shift.findOne({ operator: req.user._id, status: 'active' });
    if (activeShift) {
      return res.status(400).json({ success: false, message: 'You already have an active shift' });
    }

    const shift = await Shift.create({
      operator: req.user._id,
      operatorName: req.user.name,
      dispenser: dispenserId,
      openingCash: openingCash || 0,
      notes
    });

    res.status(201).json({ success: true, data: shift });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/shifts/end/:id
// @desc    Close shift and calculate totals
router.post('/end/:id', protect, logActivity('END_SHIFT', 'Shift'), async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) return res.status(404).json({ success: false, message: 'Shift not found' });
    if (shift.status === 'closed') return res.status(400).json({ success: false, message: 'Shift is already closed' });

    const endTime = new Date();
    
    // Aggregate transactions for this shift
    const transactions = await Transaction.find({
      operator: shift.operator,
      createdAt: { $gte: shift.startTime, $lte: endTime }
    });

    const totalTransactions = transactions.length;
    const totalVolumeLitres = transactions.reduce((acc, t) => acc + t.quantity, 0);
    const totalRevenue = transactions.reduce((acc, t) => acc + t.totalAmount, 0);

    // Fuel breakdown calculation
    const fuelTypes = ['petrol', 'diesel', 'premium'];
    const fuelBreakdown = fuelTypes.map(type => {
      const typeTxns = transactions.filter(t => t.fuelType === type);
      return {
        fuelType: type,
        litres: typeTxns.reduce((acc, t) => acc + t.quantity, 0),
        revenue: typeTxns.reduce((acc, t) => acc + t.totalAmount, 0)
      };
    }).filter(b => b.litres > 0);

    shift.endTime = endTime;
    shift.status = 'closed';
    shift.closingCash = req.body.closingCash || 0;
    shift.totalTransactions = totalTransactions;
    shift.totalVolumeLitres = totalVolumeLitres;
    shift.totalRevenue = totalRevenue;
    shift.fuelBreakdown = fuelBreakdown;
    shift.notes = req.body.notes || shift.notes;

    await shift.save();
    res.json({ success: true, data: shift });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/shifts
// @desc    Get all shifts with filters
router.get('/', protect, async (req, res) => {
  try {
    const { operatorId, dispenserId, status, startDate, endDate } = req.query;
    const query = {};

    if (operatorId) query.operator = operatorId;
    if (dispenserId) query.dispenser = dispenserId;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    // If not admin, only show own shifts
    if (req.user.role !== 'admin') {
      query.operator = req.user._id;
    }

    const shifts = await Shift.find(query)
      .populate('operator', 'name email role')
      .populate('dispenser', 'name dispenserId')
      .sort({ startTime: -1 });

    res.json({ success: true, data: shifts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/shifts/active
// @desc    Get current active shift for user
router.get('/active', protect, async (req, res) => {
  try {
    const shift = await Shift.findOne({ operator: req.user._id, status: 'active' })
      .populate('dispenser', 'name dispenserId');
    res.json({ success: true, data: shift });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/shifts/:id
// @desc    Get shift detail with transactions
router.get('/:id', protect, async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id)
      .populate('operator', 'name role')
      .populate('dispenser', 'name dispenserId');
    
    if (!shift) return res.status(404).json({ success: false, message: 'Shift not found' });

    // Fetch transactions for this shift
    const end = shift.endTime || new Date();
    const transactions = await Transaction.find({
      operator: shift.operator,
      createdAt: { $gte: shift.startTime, $lte: end }
    }).populate('vehicle', 'plateNumber make model');

    res.json({ success: true, data: { shift, transactions } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
