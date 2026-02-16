# Real Estate Frontend (React)

A React-based frontend for the RealEstate management system. Connects to the Spring Boot backend and provides user flows for Admin, Seller, and Buyer.

## Tech Stack
- React 18
- JavaScript (ES6+)
- CSS Modules
- Context API

## Quick Start

### 1. Prerequisites
- Node.js (v16+ recommended)
- npm

### 2. Install Dependencies
```bash
cd real estate/realestate/realestate/propmanage-frontend
npm install --legacy-peer-deps
```

### 3. Run the App
```bash
npm start
```

The app will run on `http://localhost:3000` (or another port if 3000 is busy).

## Features
- User authentication (login/register)
- Admin dashboard (block/unblock users)
- Seller dashboard (add/view properties)
- Buyer dashboard (browse/filter/favorite properties)

## Project Structure
- `src/pages/` — Main page components (Home, AdminDashboard, SellerDashboard, BuyerDashboard)
- `src/services/` — API service for backend communication
- `src/context/` — Auth context for user state
- `src/styles/` — CSS files

## Notes
- Make sure the backend server is running and CORS is enabled for your frontend port.
- Update API base URL in `src/services/apiService.js` if needed.

## Status
✅ Production Ready | Version 1.0.0 | February 2026
