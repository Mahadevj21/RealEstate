-- PostgreSQL Setup Script for Real Estate Application
-- Run this script in PostgreSQL psql to create database and initial data

-- Create database
CREATE DATABASE realestate;

-- Connect to the database (in psql: \c realestate)
-- Then run the following:

-- Drop existing tables if they exist (optional)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS favourites CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'BUYER',
    balance DECIMAL(10, 2) DEFAULT 0.00,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create properties table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    address VARCHAR(255),
    seller_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    image_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create deals table
CREATE TABLE deals (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id),
    buyer_id INTEGER NOT NULL REFERENCES users(id),
    seller_id INTEGER NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    deal_id INTEGER REFERENCES deals(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create favourites table
CREATE TABLE favourites (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER NOT NULL REFERENCES users(id),
    property_id INTEGER NOT NULL REFERENCES properties(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(buyer_id, property_id)
);

-- Insert initial users with bcrypt hashed passwords (all passwords are 'password')
-- Bcrypt hash of 'password': $2a$10$1n5TpG77eSBBLiFXfTQqnOS9dWP4P.rFcsKsLPEhhbmG8f2RMU48i
INSERT INTO users (username, email, password, role, balance, is_blocked) VALUES
('admin', 'admin@realestate.com', '$2a$10$1n5TpG77eSBBLiFXfTQqnOS9dWP4P.rFcsKsLPEhhbmG8f2RMU48i', 'ADMIN', 0.00, FALSE),
('seller', 'seller@realestate.com', '$2a$10$1n5TpG77eSBBLiFXfTQqnOS9dWP4P.rFcsKsLPEhhbmG8f2RMU48i', 'SELLER', 1500.00, FALSE),
('buyer', 'buyer@realestate.com', '$2a$10$1n5TpG77eSBBLiFXfTQqnOS9dWP4P.rFcsKsLPEhhbmG8f2RMU48i', 'BUYER', 1500.00, FALSE),
('techseeker', 'techseeker@realestate.com', '$2a$10$1n5TpG77eSBBLiFXfTQqnOS9dWP4P.rFcsKsLPEhhbmG8f2RMU48i', 'SELLER', 1000.00, FALSE);

-- Insert initial properties (seller with id=2 owns these)
INSERT INTO properties (title, description, price, address, seller_id, status) VALUES
('Beautiful House', 'Spacious family house with garden', 150.00, '123 Main Street', 2, 'AVAILABLE'),
('Modern Apartment', 'Luxury apartment in city center', 200.00, '456 Park Avenue', 2, 'AVAILABLE');

-- Create indexes for better performance
CREATE INDEX idx_properties_seller_id ON properties(seller_id);
CREATE INDEX idx_deals_buyer_id ON deals(buyer_id);
CREATE INDEX idx_deals_seller_id ON deals(seller_id);
CREATE INDEX idx_deals_property_id ON deals(property_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_favourites_buyer_id ON favourites(buyer_id);
