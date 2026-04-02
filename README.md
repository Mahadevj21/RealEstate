# 🏡 PropManage - Real Estate Management System

A comprehensive, full-stack real estate property management application designed to provide a seamless experience for buyers looking for homes, sellers managing their listings, and administrators overseeing the platform.

---

## ✨ Key Features

This application features dedicated dashboards tailored to three primary user roles:

### 🛡️ Admin
- **User Management**: Monitor platform users with the ability to block or unblock accounts.
- **Listing Moderation**: Full administrative control over properties, including the ability to remove listings that violate platform standards.
- **Dashboard Overview**: Access a centralized view of system activity and user distribution.

### 🏠 Seller
- **Property Management**: Create and list new properties dynamically.
- **Inventory Control**: Update existing property details seamlessly using intuitive, inline edit forms designed for optimal user experience.
- **Listing Deletion**: Remove properties from the market when they are sold or no longer available.

### 🔑 Buyer
- **Property Discovery**: Browse an expansive list of available real estate properties.
- **Advanced Filtering**: Quickly find the perfect home by filtering properties based on specific criteria like location and price.
- **Favorites**: Bookmark favorite properties to review or make decisions on later.

### 🎨 General Platform Enhancements
- **Dynamic UI/UX**: Clean, responsive, and modern interface built with robust CSS.
- **Interactive Modals**: Readily accessible Settings and FAQ modals to guide the onboarding process and improve clarity.
- **Robust Authentication Context**: Secure login and consistent state tracking across all views.

---

## 🛠️ Technology Stack

**Frontend**
- **Framework**: React.js
- **Styling**: Vanilla CSS / CSS Modules
- **State Management**: React Context API
- **Build Tool**: Create React App / NPM

**Backend**
- **Framework**: Spring Boot (Java 17)
- **Database**: PostgreSQL
- **ORM**: Hibernate / Spring Data JPA
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
spring.datasource.password=----
spring.jpa.hibernate.ddl-auto=update
```

Run the Spring Boot Application:
```bash
cd backend
mvn spring-boot:run
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
**Production Ready** | Version 1.2.0

*Thank you for exploring PropManage! Feel free to contribute or report any issues.*
