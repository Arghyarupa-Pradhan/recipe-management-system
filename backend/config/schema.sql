-- ============================================================
-- RECIPE MANAGEMENT SYSTEM - MySQL Schema
-- Run this file once in Railway to set up your database
-- ============================================================

-- CREATE DATABASE IF NOT EXISTS recipe_db;
-- USE recipe_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  skill_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User dietary preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  dietary_tags JSON DEFAULT NULL,       -- ["vegetarian", "gluten-free"]
  allergies JSON DEFAULT NULL,          -- ["peanuts", "dairy"]
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User ingredient preferences (include or exclude)
CREATE TABLE IF NOT EXISTS user_ingredient_prefs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ingredient VARCHAR(100) NOT NULL,
  type ENUM('include', 'exclude') NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Saved / bookmarked recipes (meal_id = TheMealDB ID)
CREATE TABLE IF NOT EXISTS saved_recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  meal_id VARCHAR(20) NOT NULL,
  meal_name VARCHAR(200),
  meal_thumb VARCHAR(500),
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_save (user_id, meal_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reviews and ratings
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  meal_id VARCHAR(20) NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (user_id, meal_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
