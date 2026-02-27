const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name email')
      .populate('vehicle', 'plateNumber')
      .sort('-createdAt');
    res.json({ success: true, data: feedbacks });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const feedback = await Feedback.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: feedback });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/:id/respond', protect, authorize('admin'), async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id,
      { adminResponse: req.body.response, status: 'resolved' }, { new: true });
    res.json({ success: true, data: feedback });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
