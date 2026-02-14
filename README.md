# Real Estate Backend API

A Spring Boot backend for a real estate management system with user authentication, property management, favorites, and filtering.

## Tech Stack
- **Java 17** | **Spring Boot 3.5.10** | **PostgreSQL** | **Maven**

## Quick Start

### 1. Prerequisites
- Java 17
- PostgreSQL
- Maven

### 2. Database Setup
```sql
CREATE DATABASE RealEstate;
```

### 3. Configure Database
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/RealEstate
spring.datasource.username=postgres
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
```

### 4. Run Application
```bash
git clone https://github.com/Mahadevj21/realestate-backend.git
cd realestate-backend
mvn spring-boot:run
```

Server runs on `http://localhost:8080`

## User Roles
- **Admin** - Manage users (block/unblock)
- **Seller** - List properties for sale
- **Buyer** - Browse, filter, and favorite properties

## API Endpoints

### Authentication
| Method | Endpoint |
|--------|----------|
| POST | `/auth/register` |
| POST | `/auth/login` |

### Properties
| Method | Endpoint |
|--------|----------|
| POST | `/properties/add/{sellerId}` |
| GET | `/properties` |
| DELETE | `/properties/{propertyId}` |

### Admin
| Method | Endpoint |
|--------|----------|
| PUT | `/admin/users/{userId}/block` |
| PUT | `/admin/users/{userId}/unblock` |

### Buyer - Favorites
| Method | Endpoint |
|--------|----------|
| POST | `/buyer/{buyerId}/favourites/{propertyId}` |
| GET | `/buyer/{buyerId}/favourites` |
| DELETE | `/buyer/{buyerId}/favourites/{propertyId}` |

### Buyer - Filters
| Method | Endpoint |
|--------|----------|
| GET | `/buyer/filter/location?location=Mumbai` |
| GET | `/buyer/filter/price?minPrice=100000&maxPrice=500000` |
| GET | `/buyer/available` |
| GET | `/buyer/filter/advanced?location=Mumbai&minPrice=100000&maxPrice=500000&sold=false` |

## Example Requests

**Register User**
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@test.com","password":"pass123"}'
```

**Add Property**
```bash
curl -X POST http://localhost:8080/properties/add/2 \
  -H "Content-Type: application/json" \
  -d '{"title":"Apartment","description":"3BHK","price":5000000,"location":"Mumbai"}'
```

**Filter Properties**
```bash
curl -X GET "http://localhost:8080/buyer/filter/price?minPrice=1000000&maxPrice=5000000"
```

**Add to Favorites**
```bash
curl -X POST http://localhost:8080/buyer/3/favourites/5 \
  -H "Content-Type: application/json"
```

## Features
✅ User registration & login  
✅ Property listing & management  
✅ Block/Unblock users  
✅ Favorite properties  
✅ Advanced filtering (location, price, availability)  

## Status
✅ Production Ready | Version 1.0.0 | February 2026
