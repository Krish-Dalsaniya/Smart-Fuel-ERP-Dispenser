const express = require('express');
const router = express.Router();
const NotificationSettings = require('../models/NotificationSettings');
const NotificationLog = require('../models/NotificationLog');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/notifications/settings
// @desc    Get user notification settings
router.get('/settings', protect, async (req, res) => {
  try {
    let settings = await NotificationSettings.findOne({ user: req.user._id });
    if (!settings) {
      settings = await NotificationSettings.create({ 
        user: req.user._id,
        phone: req.user.phone || '' 
      });
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/notifications/settings
// @desc    Update user notification settings
router.put('/settings', protect, async (req, res) => {
  try {
    const settings = await NotificationSettings.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/notifications/logs
// @desc    Get all notification logs (Admin only)
router.get('/logs', protect, authorize('admin'), async (req, res) => {
  try {
    const logs = await NotificationLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
