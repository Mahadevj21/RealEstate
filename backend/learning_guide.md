# PropManage - Complete Learning Guide

Welcome to the **PropManage** project guide! This document is written to help you go from zero knowledge to a full understanding of the project. Read through it step-by-step, and you will be fully prepared for your college viva, presentations, and technical interviews.

---

## 1. Project Overview (Explain Like I'm 15)

Imagine you want to buy a used bicycle, but you don't know who is selling one. Similarly, someone has a bicycle to sell, but they don't know who wants to buy it. You both use a website like OLX to find each other. 

**PropManage** is exactly like that, but for **Real Estate (Houses, Apartments, Villas)**. 

### What the project does:
It is an online platform where people who want to sell properties can list them, and people who want to buy properties can browse, search, and purchase them. 

### Who the users are:
There are 3 types of users in our system:
1. **Buyer:** Searches for houses, adds them to a "favorites" list, and requests to buy them using a digital wallet.
2. **Seller:** Uploads property details (photos, price, location) and decides whether to accept or reject a buyer's request.
3. **Admin:** The boss of the platform. They monitor everything, take a "brokerage fee" (commission) for every successful sale, and can block bad users.

---

## 2. System Architecture (Big Picture)

Every modern software project is split into three main parts. Think of it like a **Restaurant**:

1. **Frontend (The Customer Area & Menu):** This is what you see on your screen—the buttons, images, and text. In a restaurant, it's the dining area and the menu. The user interacts with this.
2. **Backend (The Kitchen):** This is the brain behind the scenes. When you click "Buy", the frontend sends a request to the backend. The backend checks if you have enough money and processes the order. In a restaurant, it's the kitchen where chefs prepare food based on waiter orders.
3. **Database (The Fridge/Store Room):** This is where all the permanent data lives. All user accounts, property prices, and transaction history are stored here securely.

### How they communicate (Client-Server Architecture):
- The **Frontend (Client)** sends an HTTP Request (like a waiter taking an order).
- The **Backend (Server)** receives the request, processes the logic, and talks to the **Database**.
- The **Database** gives the requested data to the Server.
- The **Server** sends back an HTTP Response containing **JSON** (a simple text format for transferring data) to the Frontend.
- The **Frontend** updates the screen using that data.

We use **REST APIs** (Representational State Transfer) to make this communication happen. APIs act as the "waiters" carrying messages between the frontend and backend.

---

## 3. Technologies Used

Here are the tools used to build this project:

### Frontend Technologies
*   **React JS:** A popular JavaScript toolkit made by Facebook. We use it to build the User Interface (UI). It makes the website fast because it only updates the parts of the screen that change, without reloading the whole page.
*   **JavaScript (JS):** The programming language used to make websites interactive (like handling button clicks).
*   **HTML/CSS:** HTML is the skeleton (structure) of the website, and CSS is the skin/clothing (colors, fonts, layout).
*   **Recharts:** A tool used to draw beautiful graphs and pie charts on the Admin and Seller dashboards.
*   **React-Leaflet:** A mapping tool used to show properties on a real interactive map for buyers.

### Backend Technologies
*   **Java:** A powerful, secure, and widely-used programming language.
*   **Spring Boot:** A framework for Java that makes building backends extremely fast and easy. It sets up web servers automatically.
*   **Spring Data JPA / Hibernate:** A tool that lets our Java code talk to the Database without us having to write complex SQL code manually. It translates Java Objects into Database Tables.

### Database
*   **PostgreSQL:** A highly reliable, open-source Relational Database. It stores data in tables (like Excel sheets) that are linked together.

---

## 4. Folder / Project Structure

### Backend Folders (`src/main/java/com/realestate/realestate/`)
*   **`entity/`**: The "Nouns" of our project. Contains classes like `User`, `Property`, and `Deal` that directly map to database tables.
*   **`repository/`**: The "Database Talkers". Interfaces that connect entities to the database (e.g., fetching a user by ID).
*   **`service/`**: The "Brain". Contains complex business logic (e.g., deducting balance, calculating taxes, moving money from buyer to seller).
*   **`controller/`**: The "Traffic Police". Receives requests from the React frontend, passes them to the Service, and returns the response.

### Frontend Folders (`src/`)
*   **`pages/`**: Contains the main screen views like `Home.js` (Login/Signup), `BuyerDashboard.js`, `SellerDashboard.js`, and `AdminDashboard.js`.
*   **`context/`**: Contains `AuthContext.js`, which remembers who is currently logged in across the whole website.
*   **`services/`**: Contains `apiService.js`, which holds all the code that makes network calls to our Spring Boot backend.
*   **`styles/`**: Contains CSS files to make things look beautiful.

---

## 5. Backend Deep Explanation

Let's look at how a request flows through the backend.

**The Pipeline:**
`User Request → Controller → Service → Repository → Database → Response`

1. **Controller (`PropertyController.java`):** Imagine you are on the frontend and you search for properties under $1000. The React app calls a URL (`/buyer/filter/price`). The Controller receives this specific URL request.
2. **Service (`DealService.java`):** Sometimes things are complex. If a buyer wants to buy a house, the Service checks: Does the buyer have enough money? Is the house still available? It handles the "Business Rules".
3. **Repository (`PropertyRepository.java`):** If the service approves, it asks the repository to actually grab or save the data. "Hey Repository, save this Deal to the database."
4. **Entity (`Property.java`):** This is the blueprint for the data being saved. It defines that a Property has a title, price, and location.

---

## 6. Frontend Deep Explanation

The React frontend is built using **Components**. A component is a reusable piece of the screen (like a navigation bar, a button, or a property card). 

*   **Pages:** We have large components that act as pages (e.g., `AdminDashboard`).
*   **State:** React Remembers data dynamically using a Hook called `useState`. For example, if you type in a search box, the `useState` holds that text.
*   **Effects:** React reacts to things using `useEffect`. When the Buyer Dashboard first loads, `useEffect` triggers an API call to the backend to fetch all available properties automatically.
*   **API Calls (`apiService.js`):** We use the native `fetch` API to talk to the Spring Boot server. It sends JSON data to port `8080` (where Spring Boot lives) and waits for a response to display on port `3000` (where React lives).

---

## 7. Database Design

We use a Relational Database, which means data is stored in interconnected tables.

### Key Tables:
1. **`users` Table:** Stores all users. 
    *   *Columns:* `id` (Primary Key), `username`, `email`, `password`, `role` (BUYER/SELLER/ADMIN), `balance`.
2. **`properties` Table:** Stores house listings.
    *   *Columns:* `id` (Primary Key), `title`, `price`, `location`, `sold` (true/false), `seller_id` (Foreign Key pointing to `users` table). 
3. **`deals` Table:** Stores buy requests.
    *   *Columns:* `id`, `property_id`, `buyer_id`, `seller_id`, `status` (PENDING/ACCEPTED/REJECTED).
4. **`transactions` Table:** Stores the financial log (who paid whom).
5. **`favourites` Table:** Links a User to a Property they liked.

**Primary Key vs Foreign Key:**
A **Primary Key (PK)** is a unique ID for a row (like a student Roll No). A **Foreign Key (FK)** is a column that links to a PK in another table. E.g., The `seller_id` in the `properties` table is a Foreign Key that links back to the `id` in the `users` table, telling us *who* owns the house.

---

## 8. Key API Endpoints

Here are some important endpoints in our system:

*   **POST** `/auth/login`: 
    *   *Purpose:* Verifies user credentials.
    *   *Request:* JSON with `{email, password}`.
    *   *Response:* JSON with User details if successful.
*   **GET** `/properties`:
    *   *Purpose:* Fetches all properties to display on the screen.
*   **POST** `/properties/add/{sellerId}`:
    *   *Purpose:* Allows a seller to insert a new property.
    *   *Request:* Property details (title, price, image link).
*   **POST** `/buyer/buy/{propertyId}/buyer/{buyerId}`:
    *   *Purpose:* Triggers a deal request from a buyer to a seller.

*(Note: GET is used to read data, POST is used to create data, PUT is used to update data, and DELETE is used to remove data).*

---

## 9. End-to-End Data Flow: The Buying Process

What happens when a buyer clicks the **"Buy"** button on a house?

1. **Frontend:** User clicks "Confirm Buy" in `BuyerDashboard.js`.
2. **API Call:** React executes `apiService.buyProperty()`, which makes a `POST` request to the backend.
3. **Controller:** `BuyerController.java` catches the request.
4. **Service:** `DealService.java` checks the buyer's wallet. If they have enough money, it creates a new `Deal` with the status set to `PENDING`.
5. **Database:** The new deal is saved in PostgreSQL.
6. **Seller Action:** The seller sees the pending request. They click "Accept". 
7. **Service Execution:** `DealService.java` moves the property price from the Buyer's balance to the Seller's balance. It also deducts a ₹100 brokerage fee from both the buyer and the seller, giving ₹200 to the Admin. It marks the property as `Sold = true` and generates transaction records in the DB.
8. **Frontend Update:** Both dashboards automatically update to reflect the new balances and sold status.

---

## 10. Security Concepts

In this project, we kept authentication simple and straightforward for ease of learning:
*   **Database Login:** Users log in using an email and password. The backend checks if the email and password exist in the database.
*   **Role-Based Access Control (RBAC):** Users are assigned a specific role (`ADMIN`, `BUYER`, `SELLER`). The React frontend looks at this role to decide which dashboard to show you. So, a Buyer cannot see the Admin dashboard.
*   **Admin Powers:** The system includes a 'Blocked' status. The Admin has the privilege to block bad actors. If blocked, the backend `AuthController` will throw an error and prevent login.

---

## 11. Important Programming Concepts Used

*   **MVC Architecture (Model-View-Controller):** 
    *   **Model:** Our Database Entities (User, Property). Contains data.
    *   **View:** Our React Frontend. Displays data.
    *   **Controller:** Our Spring Boot Controllers. Binds Model and View.
*   **REST API:** A set of rules that programs use to talk to each other over the internet using standardized HTTP methods (GET, POST).
*   **Component-Based UI:** React builds web pages like Lego blocks. A button is a block, a text box is a block. You combine small blocks to make a big webpage.
*   **Dependency Injection:** In Spring Boot (using `@RequiredArgsConstructor`), the framework automatically provides the necessary database connections to the Services without us having to write the connection code.

---

## 12. Possible Viva Questions (For College Students)

> Use these to practice speaking confidently about your project.

1. **What is your project about?**
   *Answer:* It is a Real Estate Management platform where sellers can list properties, buyers can search and buy them, and an admin manages the users and transaction fees.
2. **What technologies did you use for the frontend and backend?**
   *Answer:* I used ReactJS for the frontend and Java with Spring Boot for the backend. My database is PostgreSQL.
3. **Why did you choose React?**
   *Answer:* React is fast because it uses a Virtual DOM. It allows us to build single-page applications (SPAs) where the page doesn't need to refresh every time we click something.
4. **Why did you choose Spring Boot?**
   *Answer:* Spring Boot is powerful and enterprise-ready. It eliminates a lot of manual setup and configuration, allowing us to build secure REST APIs very quickly.
5. **What is a REST API?**
   *Answer:* It is a way for two computer systems to communicate over the internet using standard HTTP methods like GET (to fetch data) and POST (to send data).
6. **How does your React frontend talk to the Spring Boot backend?**
   *Answer:* We use the JavaScript `fetch` API. React sends a network request to the Spring Boot URLs, receives JSON data back, and updates the state.
7. **What happens when a buyer buys a property? Explain the logic.**
   *Answer:* The backend checks if the buyer has sufficient balance. If yes, it creates a "Pending Deal". When the seller accepts, the backend deducts the property price from the buyer, adds it to the seller, takes a ₹100 brokerage fee from both, gives it to the admin, and marks the property as 'Sold'. The system also records 5 `Transaction` ledgers for transparency.
8. **What is an Entity in Spring Boot?**
   *Answer:* An Entity is a Java class that maps directly to a table in the database. Every property/variable in the class becomes a column in the table.
9. **Explain the difference between `@Controller` and `@RestController`.**
   *Answer:* `@RestController` is used for APIs. It automatically converts the returned Java data into JSON format, which React can easily read.
10. **What is a Primary Key and Foreign Key?**
    *Answer:* A Primary Key is a unique identifier for a row in a table. A Foreign Key is a column that stores the Primary Key of another table, creating a relationship between them.
11. **How do you show analytics in your project?**
    *Answer:* I use a React library called `recharts` to draw Pie Charts and Bar Charts. The backend aggregates data (like total sales or monthly growth using Java Streams) and sends it to React.
12. **How does the mapping feature work?**
    *Answer:* I used `react-leaflet` to render interactive maps. We use coordinates based on the property location string to drop interactive price pins on the map.
---

## 13. Interview Questions (For Jobs)

> These are slightly harder, focused on deep technical understanding.

1. Explain the lifecycle of a React component and which hook handles it in functional components.
2. How does React's Virtual DOM differ from the real DOM?
3. What is Dependency Injection and how does Spring Boot implement it? (Hint: `@Autowired` / Constructor Injection)
4. Explain the difference between `@GetMapping` and `@PostMapping`.
5. What does the `@PrePersist` annotation do in your Entity classes? 
6. Describe how you handle CORS (Cross-Origin Resource Sharing) between a React app on port 3000 and Spring on 8080.
7. What is the role of Spring Data JPA? What advantages does it have over raw JDBC?
8. How would you handle a scenario where two buyers try to buy the exact same property at the exact same millisecond? (Hint: Transactions and Locking).
9. Explain how React Context API works in your authentication flow.
10. If the database schema changes (like adding a `createdAt` column), how did you handle existing rows without breaking the application during Hibernate updates?

---

## 14. Project Improvements (Future Scope)

If an examiner asks "How can you improve this project?", you should say:

1. **Authentication:** Instead of plain login, implement **JWT (JSON Web Tokens)** for highly secure, stateless authentication.
2. **Payment Gateway:** Instead of a simulated digital wallet, integrate **Stripe or Razorpay** API for real money transactions and wallet recharges.
3. **Cloud Image Hosting:** Right now users paste image URLs. Moving forward, I would use **AWS S3** to allow users to upload image files directly from their computers.
4. **Geocoding API:** Currently, properties are pinned on the map using hardcoded city coordinates. Implementing Google Maps Geocoding API would allow exact street-level mapping.
5. **Pagination:** Implementing database pagination (using Spring Data `Pageable`) so that if there are 100,000 properties, the server doesn't crash trying to load them all at once.

---

## 15. The "One-Minute" Presentation Pitch

> **Memorize this and speak clearly when asked "Explain your project" at the start of your demo.**

"Good morning. My project is **PropManage**, a full-stack Real Estate and Property Management platform. 

It solves the problem of connecting property sellers with buyers securely. I built the frontend using **React.js** for a dynamic user experience, and the backend using **Java with Spring Boot**, storing data in a **PostgreSQL** database.

The system supports three user roles: Buyers, Sellers, and Admins. Sellers can upload property listings, while Buyers can filter properties, view them on an interactive map, and send purchase requests via an in-built digital wallet. The backend handles complex financial transactions—moving money from buyers to sellers while automatically calculating and transferring a platform brokerage fee to the Admin wallet securely. Finally, the platform includes dynamic analytics dashboards with live charts to track user growth and sales volume. 

Thank you."
