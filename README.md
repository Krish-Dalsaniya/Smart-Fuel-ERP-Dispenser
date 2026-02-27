# ⛽ FuelFlow ERP — Smart Fuel Dispenser System

A full-stack ERP system for managing fuel dispensers with automated vehicle-based payment processing.

## 🏗️ System Architecture

```
Frontend (React + Vite)          Backend (Node.js + Express)
  ┌─────────────────┐               ┌─────────────────────┐
  │   React + Vite  │  REST API     │    Express Server    │
  │   TailwindCSS   │◄────────────►│    JWT Auth (HTTP)   │
  │   React Query   │  JWT Bearer   │    REST Endpoints    │
  └─────────────────┘               └─────────┬───────────┘
                                              │
                                    ┌─────────▼───────────┐
                                    │      MongoDB         │
                                    │  - Vehicle Coll.    │
                                    │  - Transaction Coll.│
                                    │  - User Collection  │
                                    │  - Inventory Coll.  │
                                    └─────────────────────┘
```

## 📁 Project Structure

```
fuel-erp/
├── backend/
│   ├── models/
│   │   ├── User.js          # User model (Admin/Operator/Vehicle Owner)
│   │   ├── Vehicle.js       # Vehicle model with wallet
│   │   ├── Transaction.js   # Fuel transaction records
│   │   ├── Inventory.js     # Fuel stock management
│   │   ├── Dispenser.js     # Fuel dispenser units
│   │   └── Feedback.js      # Customer feedback
│   ├── routes/
│   │   ├── auth.js          # Register, Login, /me
│   │   ├── vehicles.js      # CRUD + Vehicle identification
│   │   ├── transactions.js  # Fuel dispensing + history
│   │   ├── inventory.js     # Stock management + restocking
│   │   ├── wallet.js        # Wallet top-up & balance
│   │   ├── dispensers.js    # Dispenser management
│   │   ├── users.js         # User management (Admin)
│   │   ├── dashboard.js     # Stats & charts data
│   │   └── feedback.js      # Submit & review feedback
│   ├── middleware/
│   │   └── auth.js          # JWT protect + role-based authorization
│   ├── server.js            # Express app entry point
│   ├── seed.js              # Database seed script
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx         # Authentication page
    │   │   ├── Dashboard.jsx     # Stats, charts, recent transactions
    │   │   ├── FuelDispenser.jsx # 3-step fuel dispensing terminal
    │   │   ├── Vehicles.jsx      # Vehicle registration & management
    │   │   ├── Transactions.jsx  # Transaction history with filters
    │   │   ├── Inventory.jsx     # Stock levels & restocking
    │   │   ├── Wallet.jsx        # Wallet top-up interface
    │   │   ├── Dispensers.jsx    # Dispenser management
    │   │   ├── Users.jsx         # User management (Admin)
    │   │   └── Feedback.jsx      # Feedback submission & review
    │   ├── components/
    │   │   └── Layout.jsx        # Sidebar navigation layout
    │   ├── context/
    │   │   └── AuthContext.jsx   # Auth state management
    │   ├── utils/
    │   │   └── api.js            # Axios instance with JWT
    │   ├── App.jsx               # Router + Query client setup
    │   ├── main.jsx
    │   └── index.css             # Tailwind + custom styles
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)

### Backend Setup

```bash
cd backend
npm install

# Copy environment config
cp .env.example .env
# Edit .env and set your MONGODB_URI and JWT_SECRET

# Seed the database with demo data
node seed.js

# Start the server
npm run dev   # with nodemon (dev)
npm start     # production
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | admin123 |
| Operator | operator@demo.com | oper123 |
| Vehicle Owner | owner@demo.com | owner123 |

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login & get JWT |
| GET | /api/auth/me | Get current user |

### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/vehicles | All vehicles (Admin/Operator) |
| GET | /api/vehicles/my | Own vehicles (Owner) |
| POST | /api/vehicles | Register vehicle |
| POST | /api/vehicles/identify | Identify by plate/RFID |
| PUT | /api/vehicles/:id | Update vehicle |
| DELETE | /api/vehicles/:id | Delete vehicle |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/transactions | All transactions |
| GET | /api/transactions/my | Own vehicle transactions |
| POST | /api/transactions | Create fuel transaction |
| GET | /api/transactions/:id | Single transaction |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/inventory | All fuel stock |
| POST | /api/inventory | Create inventory item |
| PUT | /api/inventory/:id | Update / restock |
| PATCH | /api/inventory/:id/price | Update price |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/wallet/vehicle/:id | Get balance |
| POST | /api/wallet/topup | Add funds |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/stats | Revenue, vehicles, charts |
| GET | /api/dashboard/recent-transactions | Last 10 transactions |

## 🔒 Role-Based Access Control

| Feature | Admin | Operator | Vehicle Owner |
|---------|-------|----------|---------------|
| Dashboard (full stats) | ✅ | ✅ | ❌ |
| Fuel Dispenser Terminal | ✅ | ✅ | ❌ |
| All Vehicles | ✅ | ✅ | Own only |
| All Transactions | ✅ | ✅ | Own only |
| Inventory Management | ✅ | ✅ | ❌ |
| Dispenser Management | ✅ | ✅ | ❌ |
| User Management | ✅ | ❌ | ❌ |
| Wallet (all vehicles) | ✅ | ✅ | Own only |
| Feedback (review) | ✅ | ❌ | Submit only |

## ⛽ Fuel Dispensing Flow

1. **Vehicle Identification** — Enter plate number or RFID tag
2. **Fuel Selection** — Choose fuel type, quantity, payment method
3. **Confirmation** — Review transaction summary
4. **Completion** — System deducts wallet, updates stock, records transaction

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs
**Frontend:** React 18, Vite, TailwindCSS, React Query, Recharts, React Router v6, Axios
