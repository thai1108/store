-- Migration script to add address and avatarUrl columns to users table
-- Run this if you have an existing database

ALTER TABLE users ADD COLUMN address TEXT;
ALTER TABLE users ADD COLUMN avatarUrl TEXT;
