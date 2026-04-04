# 🏡 PropManage - Real Estate Management System

A comprehensive, full-stack real estate property management application designed to provide a seamless experience for buyers looking for homes, sellers managing their listings, and administrators overseeing the platform ecosystem.

---

## ✨ Key Features

This application features dedicated dashboards tailored to three primary user roles:

### 🛡️ Admin
- **User Management**: Monitor platform users with the ability to block or unblock accounts.
- **Listing Moderation**: Full administrative control over properties, including the ability to remove listings that violate platform standards.
- **Analytics & Reporting**: Interactive data visualizations (powered by Recharts) showing system activity, user distribution, and platform growth.
- **Platform Wallet**: The admin collects a standardized brokerage fee on every successful property transaction, with a dedicated ledger to view platform earnings.

### 🏠 Seller
- **Property Management**: Create and list new properties dynamically with image uploads, dynamic pricing, and structural details (beds/baths).
- **Deal Management**: View incoming purchase requests directly from interested buyers. Accept or reject offers with a single click.
- **Wallet & Transactions**: A custom digital wallet to receive funds upon successful property sales, featuring a complete transaction ledger.
- **Seller Analytics**: Visual performance metrics tracking cash balances and active property listing volumes.

### 🔑 Buyer
- **Property Discovery**: Browse an expansive list of available real estate properties through dynamic grids.
- **Interactive Map View**: Discover properties geographically using an integrated interactive map (powered by Leaflet).
- **Advanced Filtering**: Quickly find the perfect home by filtering properties based on criteria like location, minimum/maximum price, bedrooms, and property type.
- **Digital Wallet Purchasing**: Buyers can trigger property purchases using their digital wallet, sending funds securely into escrow pending seller approval.
- **Favorites**: Bookmark favorite properties to review or make decisions on later.

### 🎨 General Platform Enhancements
- **Dynamic UI/UX**: Clean, responsive, and modern interface built with robust Vanilla CSS.
- **Humanized Codebase**: Professionally structured backend controllers and frontend components.
- **Robust Authentication**: Secure login and consistent state tracking via React Context API.

---

## 🛠️ Technology Stack

**Frontend**
- **Framework**: React.js
- **Styling**: Vanilla CSS
- **Data Visualization**: Recharts
- **Mapping**: React-Leaflet
- **State Management**: React Context API
- **HTTP Client**: API Fetch Service

**Backend**
- **Framework**: Java 17 / Spring Boot 3
- **Database**: PostgreSQL
- **ORM**: Hibernate / Spring Data JPA
- **Architecture**: MVC / REST API
- **Build Tool**: Maven

---

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running.

### 1. Prerequisites
Make sure you have the following installed on your local machine:
- [Java 17+](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Maven](https://maven.apache.org/download.cgi)
- [Node.js (v16+) & npm](https://nodejs.org/)

### 2. Database Setup
Create the requisite PostgreSQL database:
```sql
CREATE DATABASE RealEstate;
```

### 3. Backend Configuration
Navigate to the `backend` directory and configure your database credentials. 
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/RealEstate
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

Run the Spring Boot Application:
```bash
cd backend
mvnw spring-boot:run
```
*The backend API will be available on `http://localhost:8080`*

### 4. Frontend Configuration
Navigate to the `frontend` directory to install dependencies and run the client:
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```
*The web dashboard will be available on `http://localhost:3000`*

---

## ✅ Status
**Production Ready** | Version 1.5.0

*Thank you for exploring PropManage! Feel free to contribute or report any issues.*
