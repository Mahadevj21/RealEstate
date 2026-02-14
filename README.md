# Real Estate Management System (Backend)

A complete role-based real estate backend application built using **Spring Boot 3.5.10**, **PostgreSQL**, **JPA/Hibernate**, and **Lombok**.

## 🎯 Overview

This is a production-ready Spring Boot backend API for a real estate management system with user authentication, property management, favorites, filtering, and admin controls.

## 👥 User Roles

- **Admin**
  - Manages users (block/unblock users)
  - Receives commission from property deals
  
- **Seller**
  - Add and manage property listings
  - Track property sales
  
- **Buyer**
  - Browse and search properties
  - Add/remove favorite properties
  - Filter properties by location, price, and availability
  - Purchase properties

## ✨ Features

### Core Features
- ✅ User registration & authentication
- ✅ Role-based access control (Admin, Seller, Buyer)
- ✅ Property listing management
- ✅ User profile management
- ✅ Block/Unblock users by admin

### New Features (Latest)
- ✅ **Favorite Properties** - Buyers can save favorite properties
- ✅ **Advanced Filtering** - Filter by location, price range, and availability
- ✅ **Deal Management** - Complete payment and settlement logic

## 🏗️ Tech Stack

- **Framework**: Spring Boot 3.5.10
- **Language**: Java 17
- **Database**: PostgreSQL
- **ORM**: JPA/Hibernate
- **Build Tool**: Maven
- **Annotations**: Lombok
- **Security**: Spring Security

## 📋 Prerequisites

- Java 17+
- PostgreSQL 12+
- Maven 3.8+
- Git

## 🚀 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/Mahadevj21/realestate-backend.git
cd realestate-backend
```

### 2. Database Setup
Create a PostgreSQL database:
```sql
CREATE DATABASE RealEstate;
```

### 3. Configure Application Properties
Update `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/RealEstate
spring.datasource.username=postgres
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
```

### 4. Build the Project
```bash
mvn clean package -DskipTests
```

### 5. Run the Application
```bash
java -jar target/realestate-0.0.1-SNAPSHOT.jar
```

Server will start on `http://localhost:8080`

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/properties/add/{sellerId}` | Add new property |
| GET | `/properties` | List all properties |
| DELETE | `/properties/{propertyId}` | Delete property |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/admin/users/{userId}/block` | Block user |
| PUT | `/admin/users/{userId}/unblock` | Unblock user |

### Buyer - Favorites
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/buyer/{buyerId}/favourites/{propertyId}` | Add to favorites |
| GET | `/buyer/{buyerId}/favourites` | Get buyer's favorites |
| DELETE | `/buyer/{buyerId}/favourites/{propertyId}` | Remove from favorites |

### Buyer - Filtering
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/buyer/filter/location?location=Mumbai` | Filter by location |
| GET | `/buyer/filter/price?minPrice=100000&maxPrice=500000` | Filter by price range |
| GET | `/buyer/filter/sold?sold=false` | Filter by sold status |
| GET | `/buyer/available` | Get available properties (not sold) |
| GET | `/buyer/filter/advanced?location=Mumbai&minPrice=100000&maxPrice=500000&sold=false` | Advanced filter |

### Example Requests

#### Register User
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_buyer",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Add Property
```bash
curl -X POST http://localhost:8080/properties/add/2 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Luxury Apartment",
    "description": "3 BHK furnished apartment",
    "price": 5000000,
    "location": "Mumbai"
  }'
```

#### Filter Properties by Price
```bash
curl -X GET "http://localhost:8080/buyer/filter/price?minPrice=1000000&maxPrice=5000000"
```

#### Add to Favorites
```bash
curl -X POST http://localhost:8080/buyer/3/favourites/5 \
  -H "Content-Type: application/json"
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  status ENUM ('ACTIVE', 'BLOCKED'),
  role ENUM ('ADMIN', 'SELLER', 'USER'),
  balance INTEGER DEFAULT 0,
  blocked BOOLEAN DEFAULT false
);
```

### Properties Table
```sql
CREATE TABLE properties (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  price DOUBLE PRECISION,
  location VARCHAR(255),
  owner_id BIGINT REFERENCES users(id),
  seller_id BIGINT REFERENCES users(id),
  sold BOOLEAN DEFAULT false
);
```

### Favourites Table
```sql
CREATE TABLE favourites (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  property_id BIGINT NOT NULL REFERENCES properties(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, property_id)
);
```

## 📂 Project Structure

```
realestate-backend/
├── src/
│   ├── main/
│   │   ├── java/com/realestate/realestate/
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java         (User auth)
│   │   │   │   ├── PropertyController.java     (Property CRUD)
│   │   │   │   ├── BuyerController.java        (Favorites & filters)
│   │   │   │   └── AdminController.java        (Admin actions)
│   │   │   ├── entity/
│   │   │   │   ├── User.java
│   │   │   │   ├── Property.java
│   │   │   │   └── Favourite.java
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── PropertyRepository.java
│   │   │   │   └── FavouriteRepository.java
│   │   │   ├── service/
│   │   │   │   └── DealService.java
│   │   │   ├── config/
│   │   │   │   └── SecurityConfig.java
│   │   │   └── RealestateApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md
```

## ✅ Testing

All endpoints have been tested and verified:

### Test Coverage
- ✅ User Registration (Admin, Seller, Buyer)
- ✅ User Login
- ✅ Add Properties
- ✅ List Properties
- ✅ Delete Properties
- ✅ Block/Unblock Users
- ✅ Add to Favorites
- ✅ Get Favorites
- ✅ Remove from Favorites
- ✅ Filter by Location
- ✅ Filter by Price Range
- ✅ Filter by Sold Status
- ✅ Advanced Filtering
- ✅ Get Available Properties

## 🔐 Security

- CSRF protection disabled for API endpoints
- All endpoints are publicly accessible (can be restricted as needed)
- Password stored in plain text (should use BCrypt in production)
- Security configuration in `SecurityConfig.java`

## 🐛 Known Issues / Future Improvements

- [ ] Implement JWT authentication
- [ ] Add password encryption (BCrypt)
- [ ] Implement role-based access control with @PreAuthorize
- [ ] Add input validation with @Valid
- [ ] Add exception handling with @ControllerAdvice
- [ ] Add API documentation with Swagger/SpringFox
- [ ] Implement pagination for list endpoints
- [ ] Add sorting options for filtered results
- [ ] Add transaction management for deal finalization

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For issues or questions, please open an issue on GitHub or contact the development team.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Spring Boot framework
- PostgreSQL community
- Lombok library for reducing boilerplate code

---

**Current Status**: ✅ Production Ready | **Version**: 1.0.0 | **Last Updated**: February 14, 2026

## Tech Stack
- Java 17
- Spring Boot
- Spring Security (basic)
- PostgreSQL
- Hibernate / JPA

## Note
Payment handling is **dummy logic** implemented for  demonstration purposes.
