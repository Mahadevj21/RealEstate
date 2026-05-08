# 📚 PropManage: Technical & Interview Guide

This document is designed to help you explain the project to recruiters and prepare for technical interviews. It covers the architectural decisions, the "why" behind the tech stack, and deep dives into the core technologies used.

---

## 🌍 Part 1: The "Real-World" Problem & Solution

### The Problem
Traditional real-estate transactions are often fragmented. Buyers use one site to browse, another to communicate, and offline methods for payments. Sellers have no way to verify if a buyer can actually afford a property before entering negotiations, and security (like data tampering) is a constant risk.

### The PropManage Solution
PropManage provides a **unified, secure ecosystem**:
1.  **Digital Escrow-Style Wallet**: Every user has a balance. This ensures financial readiness before a deal is even requested.
2.  **Role-Based Access Control (RBAC)**: Distinct dashboards for Admin, Seller, and Buyer ensure that users only see the data they need.
3.  **Data Integrity**: Using Spring Security and JWT, we ensure that every action (buying, selling, deleting) is cryptographically verified.

---

## 🛠️ Part 2: The Tech Stack (The "Why")

| Tech | Why we used it |
| :--- | :--- |
| **Spring Boot** | It provides a "convention over configuration" approach. It's the industry standard for building robust, production-grade microservices. |
| **React.js** | Its component-based architecture allows for a highly responsive UI. Using the **Context API** allowed us to manage user authentication state globally without "prop drilling." |
| **PostgreSQL** | A powerful, open-source relational database. We chose it because it supports complex transactions and ACID properties, which are critical for financial data. |
| **Spring Security & JWT** | We chose **Stateless Authentication** (JWT) because it allows the backend to scale horizontally easily. The server doesn't need to store session data in memory. |

---

## 🔐 Part 3: Deep Dive: How JWT Works

### **Level 1: Basic (The "ID Badge" Analogy)**
Think of a JWT like a **Digital ID Badge**. 
1. You login with your username/password.
2. The server gives you a badge (the token).
3. Every time you want to do something (like buy a house), you show the badge.
4. The server looks at the badge to see who you are and what you're allowed to do.

### **Level 2: Medium (The Structure)**
A JWT has 3 parts separated by dots: `Header.Payload.Signature`
- **Header**: Tells us the algorithm used (e.g., HS256).
- **Payload**: Contains "Claims" (data). We store the `email`, `role`, and `userId`.
- **Signature**: This is the most important part. It's a hash of the Header + Payload + a **Secret Key** known only to the server. 
- *Crucial Fact*: If a user changes even one letter in the Payload (e.g., trying to change their role from BUYER to ADMIN), the signature becomes invalid, and the server rejects it.

### **Level 3: Advanced (Statelessness & Security)**
JWT is **Stateless**. Traditional sessions require the server to store a "Session ID" in its database/memory. With JWT, the server stores **nothing**. It just verifies the signature. 
- **Security implementation in PropManage**: We used `OncePerRequestFilter` to intercept every request, extract the token from the `Authorization: Bearer` header, and populate the `SecurityContextHolder`. This allows us to use `@PreAuthorize` or role-based matching in the `SecurityConfig`.

---

## 🏛️ Part 4: Core Engineering Concepts

### **1. ACID Properties (The "Money Rule")**
When a buyer buys a property, four things happen:
1. Buyer balance decreases.
2. Seller balance increases.
3. Admin balance increases (brokerage).
4. Property status changes to "Sold".

**ACID** ensures that if *any* of these fail, *all* of them fail. 
- **Atomicity**: The whole deal happens as one unit.
- **Consistency**: The total amount of money in the system remains correct.
- **Isolation**: Two buyers can't buy the same property at the exact same time.
- **Durability**: Once the transaction is saved, it survives a server crash.
*In PropManage, we achieved this using the `@Transactional` annotation.*

### **2. CORS (Cross-Origin Resource Sharing)**
Browsers prevent a website at `localhost:3000` (React) from talking to a server at `localhost:8080` (Spring) for security. 
- **How we fixed it**: We configured a `CorsConfigurationSource` to explicitly allow your frontend URL. In production, we use environment variables to make this flexible.

### **3. IDOR (Insecure Direct Object Reference)**
This is a common security flaw where a user can change a URL (like `/api/delete-property/50`) to delete a property they don't own.
- **Our Fix**: In every controller, we extract the `userId` from the **JWT token** (which cannot be faked) and compare it against the `ownerId` of the property in the database.

---

## ❓ Part 5: Common Interview Questions

**Q1: Why did you use BCrypt for passwords instead of just MD5?**
*Answer*: MD5 is fast and can be broken with "Rainbow Tables" (pre-calculated hashes). BCrypt is a "slow" hashing algorithm that uses **Salting** and multiple rounds of hashing, making it resistant to brute-force attacks.

**Q2: What is the benefit of using DTOs or @JsonIgnore?**
*Answer*: It prevents **Data Leakage**. By using `@JsonIgnore` on the password field, we ensure the hashed password never leaves the server, even if we return the `User` object. It also prevents **Mass Assignment** attacks where a user might try to update their own `balance` by sending it in a JSON request.

**Q3: How do you handle performance as the number of properties grows?**
*Answer*: Instead of fetching all properties into the server's memory (`findAll()`) and filtering them in Java, we use **SQL-level filtering** with JPA Query methods. This offloads the work to the database engine, which is much more efficient.

**Q4: How does Spring Boot know who the "Current User" is?**
*Answer*: After the `JwtAuthFilter` verifies the token, it sets an `Authentication` object in the `SecurityContextHolder`. We can then access this in any Controller or Service to get the logged-in user's details.

---

*This guide proves you didn't just "write code"—you designed a system.*
