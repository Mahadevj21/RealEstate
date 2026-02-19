# Real Estate Full-Stack Application

This repository contains both the **Backend** (Spring Boot) and the **Frontend** (React) for the Real Estate management system.

## Project Structure
- **/backend**: Spring Boot API (Java 17, PostgreSQL, Maven)
- **/frontend**: React Dashboard (JavaScript, CSS Modules)

---

## 🚀 Backend Setup

### 1. Prerequisites
- Java 17
- PostgreSQL
- Maven

### 2. Database Setup
```sql
CREATE DATABASE RealEstate;
```

### 3. Configure Database
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/RealEstate
spring.datasource.username=postgres
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
```

### 4. Run Application
```bash
cd backend
mvn spring-boot:run
```
Server runs on `http://localhost:8080`

---

## 🎨 Frontend Setup

### 1. Prerequisites
- Node.js (v16+)
- npm

### 2. Install & Run
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```
The app will run on `http://localhost:3000`.

---

## 🔑 Features
- **Admin**: Manage users (block/unblock).
- **Seller**: List properties and manage inventory.
- **Buyer**: Browse, filter (location, price), and favorite properties.

## ✅ Status
Production Ready | Version 1.1.0 | February 2026
