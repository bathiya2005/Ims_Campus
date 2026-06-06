-- IMS Campus Student Registration and Management System
-- MySQL Database Setup Script
-- Run this AFTER: npx prisma migrate dev --name init

-- ============================================================
-- 1. Create the database
-- ============================================================
CREATE DATABASE IF NOT EXISTS ims_campus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ims_campus;

-- ============================================================
-- 2. After running prisma migrate, seed initial data:
-- ============================================================

-- Course Levels
INSERT IGNORE INTO `CourseLevel` (`name`, `code`, `createdAt`) VALUES
  ('IT Certificate', 'CERTIFICATE', NOW()),
  ('IT Diploma',     'DIPLOMA',     NOW());

-- Branches
INSERT IGNORE INTO `Branch` (`name`, `code`, `isActive`, `createdAt`) VALUES
  ('Galle',     'GLL', 1, NOW()),
  ('Matara',    'MTR', 1, NOW()),
  ('Nugegoda',  'NGD', 1, NOW()),
  ('Gampaha',   'GPH', 1, NOW()),
  ('Meegoda',   'MGD', 1, NOW()),
  ('Horana',    'HRN', 1, NOW()),
  ('Ratnapura', 'RTP', 1, NOW());

-- Default Exams
INSERT IGNORE INTO `Exam` (`name`, `fee`, `createdAt`) VALUES
  ('Photoshop',    1000, NOW()),
  ('Typing Master',1000, NOW()),
  ('Final Exam',   1000, NOW());

-- Admin User (password: admin123)
INSERT IGNORE INTO `User` (`email`, `password`, `name`, `role`, `createdAt`, `updatedAt`) VALUES
  ('admin@imscampus.lk', 'admin123', 'IMS Admin', 'admin', NOW(), NOW());

-- ============================================================
-- Verify inserts
-- ============================================================
SELECT 'CourseLevel' AS tbl, COUNT(*) AS rows FROM CourseLevel
UNION ALL
SELECT 'Branch', COUNT(*) FROM Branch
UNION ALL
SELECT 'Exam',   COUNT(*) FROM Exam
UNION ALL
SELECT 'User',   COUNT(*) FROM User;
