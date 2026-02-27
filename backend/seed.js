require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel_erp';

const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Inventory = require('./models/Inventory');
const Dispenser = require('./models/Dispenser');
const Transaction = require('./models/Transaction');

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB...');

  // Clear collections
  await Promise.all([User.deleteMany(), Vehicle.deleteMany(), Inventory.deleteMany(), Dispenser.deleteMany(), Transaction.deleteMany()]);
  console.log('Collections cleared.');

  // Create users
  const users = await User.create([
    { name: 'Admin User', email: 'admin@demo.com', password: 'admin123', role: 'admin', phone: '+91-9876543210' },
    { name: 'John Operator', email: 'operator@demo.com', password: 'oper123', role: 'operator', phone: '+91-9876543211' },
    { name: 'Raj Patel', email: 'owner@demo.com', password: 'owner123', role: 'vehicle_owner', phone: '+91-9876543212' },
    { name: 'Priya Shah', email: 'priya@demo.com', password: 'priya123', role: 'vehicle_owner', phone: '+91-9876543213' },
  ]);
  console.log(`✅ Created ${users.length} users`);

  const [admin, operator, owner1, owner2] = users;

  // Create inventory
  const inventory = await Inventory.create([
    { fuelType: 'petrol', currentStock: 8500, capacity: 10000, pricePerLiter: 96.72, lowStockThreshold: 500, lastRestocked: new Date() },
    { fuelType: 'diesel', currentStock: 4200, capacity: 8000, pricePerLiter: 89.62, lowStockThreshold: 400, lastRestocked: new Date() },
    { fuelType: 'premium', currentStock: 350, capacity: 5000, pricePerLiter: 107.15, lowStockThreshold: 300, lastRestocked: new Date() },
  ]);
  console.log(`✅ Created ${inventory.length} inventory items`);

  // Create vehicles
  const vehicles = await Vehicle.create([
    { plateNumber: 'GJ01AB1234', rfidTag: 'RFID001', owner: owner1._id, make: 'Maruti', model: 'Swift', year: 2021, fuelType: 'petrol', tankCapacity: 37, walletBalance: 5000, totalFuelConsumed: 120, totalSpent: 11607 },
    { plateNumber: 'GJ01CD5678', rfidTag: 'RFID002', owner: owner1._id, make: 'Tata', model: 'Nexon', year: 2022, fuelType: 'diesel', tankCapacity: 44, walletBalance: 3500, totalFuelConsumed: 85, totalSpent: 7618 },
    { plateNumber: 'GJ05EF9012', rfidTag: 'RFID003', owner: owner2._id, make: 'Hyundai', model: 'Creta', year: 2023, fuelType: 'petrol', tankCapacity: 50, walletBalance: 8000, totalFuelConsumed: 200, totalSpent: 19344 },
    { plateNumber: 'MH02GH3456', owner: owner2._id, make: 'Honda', model: 'City', year: 2020, fuelType: 'premium', tankCapacity: 40, walletBalance: 2000, totalFuelConsumed: 60, totalSpent: 6429 },
  ]);
  console.log(`✅ Created ${vehicles.length} vehicles`);

  // Create dispensers
  const dispensers = await Dispenser.create([
    { dispenserId: 'DISP-001', name: 'Pump 1 - Petrol', fuelType: 'petrol', status: 'idle', operator: operator._id, location: 'Bay A', totalDispensed: 5200 },
    { dispenserId: 'DISP-002', name: 'Pump 2 - Diesel', fuelType: 'diesel', status: 'idle', operator: operator._id, location: 'Bay B', totalDispensed: 3800 },
    { dispenserId: 'DISP-003', name: 'Pump 3 - Premium', fuelType: 'premium', status: 'maintenance', location: 'Bay C', totalDispensed: 1200 },
  ]);
  console.log(`✅ Created ${dispensers.length} dispensers`);

  // Create sample transactions
  const txns = [];
  const fuelTypes = ['petrol', 'diesel', 'premium'];
  const allVehicles = [vehicles[0], vehicles[1], vehicles[2], vehicles[3]];
  const invMap = {};
  inventory.forEach(i => invMap[i.fuelType] = i.pricePerLiter);

  for (let i = 0; i < 30; i++) {
    const v = allVehicles[i % allVehicles.length];
    const ft = v.fuelType;
    const qty = Math.round((5 + Math.random() * 40) * 10) / 10;
    const price = invMap[ft];
    const total = qty * price;
    const daysAgo = Math.floor(Math.random() * 14);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    txns.push({
      vehicle: v._id,
      operator: operator._id,
      dispenser: dispensers[0]._id,
      fuelType: ft,
      quantity: qty,
      pricePerLiter: price,
      totalAmount: parseFloat(total.toFixed(2)),
      paymentMethod: 'wallet',
      paymentStatus: 'completed',
      walletBalanceBefore: v.walletBalance + total,
      walletBalanceAfter: v.walletBalance,
      createdAt: date,
      updatedAt: date,
    });
  }

  await Transaction.insertMany(txns);
  console.log(`✅ Created ${txns.length} sample transactions`);

  console.log('\n🎉 Seed complete! Use these credentials:');
  console.log('  Admin:    admin@demo.com / admin123');
  console.log('  Operator: operator@demo.com / oper123');
  console.log('  Owner:    owner@demo.com / owner123');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
