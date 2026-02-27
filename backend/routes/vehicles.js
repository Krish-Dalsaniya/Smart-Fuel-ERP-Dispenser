const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const { protect, authorize } = require('../middleware/auth');

// GET all vehicles (admin/operator)
router.get('/', protect, authorize('admin', 'operator'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, fuelType } = req.query;
    const query = {};
    if (search) query.$or = [{ plateNumber: new RegExp(search, 'i') }, { make: new RegExp(search, 'i') }, { model: new RegExp(search, 'i') }];
    if (fuelType) query.fuelType = fuelType;
    const vehicles = await Vehicle.find(query).populate('owner', 'name email phone').skip((page - 1) * limit).limit(+limit).sort('-createdAt');
    const total = await Vehicle.countDocuments(query);
    res.json({ success: true, data: vehicles, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET own vehicles (vehicle owner)
router.get('/my', protect, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id });
    res.json({ success: true, data: vehicles });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET single vehicle
router.get('/:id', protect, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('owner', 'name email phone');
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: vehicle });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST create vehicle
router.post('/', protect, async (req, res) => {
  try {
    const ownerId = req.user.role === 'admin' ? (req.body.owner || req.user._id) : req.user._id;
    const vehicle = await Vehicle.create({ ...req.body, owner: ownerId });
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT update vehicle
router.put('/:id', protect, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: vehicle });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE vehicle (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST identify vehicle by plate or RFID (for dispenser)
router.post('/identify', protect, authorize('admin', 'operator'), async (req, res) => {
  try {
    const { plateNumber, rfidTag } = req.body;
    const query = plateNumber ? { plateNumber: plateNumber.toUpperCase() } : { rfidTag };
    const vehicle = await Vehicle.findOne(query).populate('owner', 'name email phone');
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: vehicle });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
