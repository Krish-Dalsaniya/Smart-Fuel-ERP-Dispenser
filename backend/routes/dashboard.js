const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const { protect, authorize } = require('../middleware/auth');

// GET admin dashboard stats
router.get('/stats', protect, authorize('admin', 'operator'), async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalRevenue,
      dailyRevenue,
      monthlyRevenue,
      totalTransactions,
      dailyTransactions,
      totalVehicles,
      activeVehicles,
      totalUsers,
      inventory
    ] = await Promise.all([
      Transaction.aggregate([{ $match: { paymentStatus: 'completed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Transaction.aggregate([{ $match: { paymentStatus: 'completed', createdAt: { $gte: startOfDay } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Transaction.aggregate([{ $match: { paymentStatus: 'completed', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Transaction.countDocuments(),
      Transaction.countDocuments({ createdAt: { $gte: startOfDay } }),
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ isActive: true }),
      User.countDocuments(),
      Inventory.find()
    ]);

    // Revenue chart - last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push({
        date: d.toISOString().split('T')[0],
        start: new Date(d.setHours(0, 0, 0, 0)),
        end: new Date(d.setHours(23, 59, 59, 999))
      });
    }

    const revenueChart = await Promise.all(last7Days.map(async (day) => {
      const result = await Transaction.aggregate([
        { $match: { paymentStatus: 'completed', createdAt: { $gte: day.start, $lte: day.end } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]);
      return {
        date: day.date,
        revenue: result[0]?.total || 0,
        transactions: result[0]?.count || 0
      };
    }));

    // Fuel breakdown
    const fuelBreakdown = await Transaction.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: '$fuelType', total: { $sum: '$totalAmount' }, quantity: { $sum: '$quantity' }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        revenue: {
          total: totalRevenue[0]?.total || 0,
          daily: dailyRevenue[0]?.total || 0,
          monthly: monthlyRevenue[0]?.total || 0
        },
        transactions: { total: totalTransactions, daily: dailyTransactions },
        vehicles: { total: totalVehicles, active: activeVehicles },
        users: { total: totalUsers },
        inventory: inventory.map(i => ({
          fuelType: i.fuelType,
          currentStock: i.currentStock,
          capacity: i.capacity,
          pricePerLiter: i.pricePerLiter,
          stockPercentage: ((i.currentStock / i.capacity) * 100).toFixed(1),
          isLowStock: i.currentStock <= i.lowStockThreshold
        })),
        revenueChart,
        fuelBreakdown
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET recent transactions for dashboard
router.get('/recent-transactions', protect, authorize('admin', 'operator'), async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('vehicle', 'plateNumber make model')
      .populate('operator', 'name')
      .sort('-createdAt').limit(10);
    res.json({ success: true, data: transactions });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
