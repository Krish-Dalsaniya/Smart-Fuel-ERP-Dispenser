const express = require('express');
const router = express.Router();
const Dispenser = require('../models/Dispenser');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const dispensers = await Dispenser.find().populate('operator', 'name');
    res.json({ success: true, data: dispensers });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const dispenser = await Dispenser.create(req.body);
    res.status(201).json({ success: true, data: dispenser });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, authorize('admin', 'operator'), async (req, res) => {
  try {
    const dispenser = await Dispenser.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: dispenser });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/:id/status', protect, authorize('admin', 'operator'), async (req, res) => {
  try {
    const dispenser = await Dispenser.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, data: dispenser });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
