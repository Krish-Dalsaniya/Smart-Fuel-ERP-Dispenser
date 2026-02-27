const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const { protect, authorize } = require('../middleware/auth');

// GET wallet balance for a vehicle
router.get('/vehicle/:vehicleId', protect, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId).select('plateNumber walletBalance owner');
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    const ownerId = vehicle.owner.toString();
    if (req.user.role === 'vehicle_owner' && ownerId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, data: { vehicleId: vehicle._id, plateNumber: vehicle.plateNumber, balance: vehicle.walletBalance } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST top up wallet
router.post('/topup', protect, async (req, res) => {
  try {
    const { vehicleId, amount, paymentMethod = 'card' } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    // Check ownership
    if (req.user.role === 'vehicle_owner' && vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    vehicle.walletBalance += parseFloat(amount);
    await vehicle.save();

    res.json({
      success: true,
      message: `Wallet topped up successfully`,
      data: { vehicleId, newBalance: vehicle.walletBalance, amount }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
