const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { protect, authorize } = require('../middleware/auth');

// GET all inventory
router.get('/', protect, async (req, res) => {
  try {
    const inventory = await Inventory.find();
    const data = inventory.map(i => ({
      ...i.toObject(),
      stockPercentage: ((i.currentStock / i.capacity) * 100).toFixed(1),
      isLowStock: i.currentStock <= i.lowStockThreshold
    }));
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST create inventory
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const inv = await Inventory.create(req.body);
    res.status(201).json({ success: true, data: inv });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT update inventory / restock
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const inv = await Inventory.findById(req.params.id);
    if (!inv) return res.status(404).json({ success: false, message: 'Not found' });

    if (req.body.restock) {
      const { quantity, supplier, cost } = req.body.restock;
      inv.currentStock = Math.min(inv.currentStock + quantity, inv.capacity);
      inv.lastRestocked = new Date();
      inv.restockHistory.push({ quantity, supplier, cost });
    }

    Object.assign(inv, req.body);
    delete inv.restock;
    await inv.save();
    res.json({ success: true, data: inv });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST update price
router.patch('/:id/price', protect, authorize('admin'), async (req, res) => {
  try {
    const inv = await Inventory.findByIdAndUpdate(req.params.id, { pricePerLiter: req.body.pricePerLiter }, { new: true });
    res.json({ success: true, data: inv });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
