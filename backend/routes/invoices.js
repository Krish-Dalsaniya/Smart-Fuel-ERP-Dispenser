const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/audit');

// Helper to generate Invoice Number
const generateInvoiceNumber = async () => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  if (settings.lastResetMonth !== currentMonth) {
    settings.invoiceCounter = 1001;
    settings.lastResetMonth = currentMonth;
  } else {
    settings.invoiceCounter += 1;
  }

  await settings.save();
  return `INV-${now.getFullYear()}-${String(settings.invoiceCounter).padStart(6, '0')}`;
};

// @route   POST /api/invoices/generate/:transactionId
// @desc    Generate a GST invoice for a transaction
router.post('/generate/:transactionId', protect, logActivity('GENERATE_INVOICE', 'Invoice'), async (req, res) => {
  try {
    const txn = await Transaction.findById(req.params.transactionId)
      .populate('vehicle')
      .populate('operator', 'name')
      .populate({ path: 'vehicle', populate: { path: 'owner', select: 'name email phone' } });

    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found' });

    // Check if invoice already exists
    let invoice = await Invoice.findOne({ transaction: txn._id });
    if (invoice) {
      return res.json({ success: true, data: invoice, message: 'Invoice already exists' });
    }

    const settings = await Settings.findOne() || await Settings.create({});
    const invoiceNumber = await generateInvoiceNumber();

    // HSN Codes
    const hsnCodes = { petrol: '27101220', diesel: '27101290', premium: '27101220' };
    
    // Tax Calculations (Exclusive of GST assumed in base price for calculation logic, 
    // but usually fuel is inclusive. Request says CGST @ 9%, SGST @ 9%. 
    // We will treat the totalAmount as Inclusive and back-calculate or treat as Exclusive.
    // User requested: Tax summary table: Base Amount, CGST @ 9%, SGST @ 9%, Total.
    // Let's assume ratePerLitre is Exclusive for the purpose of this demo to show math.)
    
    const baseAmount = txn.totalAmount / 1.18; // Assuming 18% total GST
    const totalGst = txn.totalAmount - baseAmount;
    const cgstAmount = totalGst / 2;
    const sgstAmount = totalGst / 2;

    invoice = await Invoice.create({
      invoiceNumber,
      transaction: txn._id,
      vehicle: txn.vehicle?._id,
      customer: txn.vehicle?.owner?._id,
      customerName: txn.vehicle?.owner?.name || 'Walk-in Customer',
      stationName: settings.stationName,
      stationGSTIN: settings.stationGSTIN,
      stationAddress: settings.stationAddress,
      fuelType: txn.fuelType,
      quantity: txn.quantity,
      ratePerLitre: txn.pricePerLiter,
      baseAmount: baseAmount.toFixed(2),
      cgstAmount: cgstAmount.toFixed(2),
      sgstAmount: sgstAmount.toFixed(2),
      totalAmount: txn.totalAmount,
      paymentMethod: txn.paymentMethod
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/invoices/:id/download
// @desc    Download PDF invoice
router.get('/:id/download', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('transaction');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`);
    doc.pipe(res);

    // --- PDF Header ---
    doc.fillColor('#444444').fontSize(20).text(invoice.stationName, 50, 50);
    doc.fontSize(10).text(invoice.stationAddress, 50, 80);
    doc.text(`GSTIN: ${invoice.stationGSTIN}`, 50, 95);

    doc.fillColor('#ff7d0a').fontSize(24).text('TAX INVOICE', 350, 50, { align: 'right' });
    doc.fillColor('#444444').fontSize(10).text(`Invoice #: ${invoice.invoiceNumber}`, 350, 85, { align: 'right' });
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 350, 100, { align: 'right' });

    doc.moveTo(50, 130).lineTo(550, 130).stroke();

    // --- Customer Details ---
    doc.fontSize(12).font('Helvetica-Bold').text('Customer Details:', 50, 150);
    doc.font('Helvetica').fontSize(10).text(`Name: ${invoice.customerName}`, 50, 170);
    doc.text(`Vehicle: ${invoice.vehicle ? 'Vehicle ID Provided' : 'N/A'}`, 50, 185);
    if (invoice.customerGSTIN) doc.text(`Customer GSTIN: ${invoice.customerGSTIN}`, 50, 200);

    // --- Table Header ---
    const tableTop = 240;
    doc.font('Helvetica-Bold');
    doc.text('Description', 50, tableTop);
    doc.text('HSN', 200, tableTop);
    doc.text('Qty (L)', 280, tableTop, { width: 50, align: 'right' });
    doc.text('Rate', 340, tableTop, { width: 70, align: 'right' });
    doc.text('Amount', 420, tableTop, { width: 100, align: 'right' });
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // --- Line Item ---
    const itemTop = tableTop + 30;
    doc.font('Helvetica');
    const hsnCodes = { petrol: '27101220', diesel: '27101290', premium: '27101220' };
    doc.text(`Fuel: ${invoice.fuelType.toUpperCase()}`, 50, itemTop);
    doc.text(hsnCodes[invoice.fuelType] || '2710', 200, itemTop);
    doc.text(invoice.quantity.toFixed(2), 280, itemTop, { width: 50, align: 'right' });
    doc.text(invoice.ratePerLitre.toFixed(2), 340, itemTop, { width: 70, align: 'right' });
    doc.text(invoice.baseAmount.toFixed(2), 420, itemTop, { width: 100, align: 'right' });

    // --- Tax Summary ---
    const subtotalTop = itemTop + 60;
    doc.moveTo(350, subtotalTop).lineTo(550, subtotalTop).stroke();
    
    doc.text('Base Amount:', 350, subtotalTop + 15);
    doc.text(`INR ${invoice.baseAmount.toFixed(2)}`, 450, subtotalTop + 15, { align: 'right' });
    
    doc.text('CGST (9%):', 350, subtotalTop + 30);
    doc.text(`INR ${invoice.cgstAmount.toFixed(2)}`, 450, subtotalTop + 30, { align: 'right' });
    
    doc.text('SGST (9%):', 350, subtotalTop + 45);
    doc.text(`INR ${invoice.sgstAmount.toFixed(2)}`, 450, subtotalTop + 45, { align: 'right' });

    doc.font('Helvetica-Bold').fontSize(14).fillColor('#ff7d0a');
    doc.text('Total Amount:', 350, subtotalTop + 70);
    doc.text(`INR ${invoice.totalAmount.toFixed(2)}`, 450, subtotalTop + 70, { align: 'right' });

    // --- Footer ---
    doc.fillColor('#444444').fontSize(10).font('Helvetica');
    doc.text(`Payment Method: ${invoice.paymentMethod.toUpperCase()}`, 50, subtotalTop + 120);
    doc.text(`Transaction ID: ${invoice.transaction?._id || 'N/A'}`, 50, subtotalTop + 135);

    doc.fontSize(8).text('This is a computer generated invoice and does not require a signature.', 50, 750, { align: 'center', width: 500 });

    doc.end();

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/invoices
// @desc    Get all invoices with filters
router.get('/', protect, async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('transaction')
      .populate('vehicle')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
