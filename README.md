# IMS Campus Student Registration and Management System

A complete, production-ready student registration and management system built for **IMS Campus** using Next.js 15, MySQL, Prisma ORM, and Tailwind CSS.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MySQL credentials
DATABASE_URL="mysql://root:yourpassword@localhost:3306/ims_campus"
```

### 3. Setup Database
```bash
mysql -u root -p -e "CREATE DATABASE ims_campus CHARACTER SET utf8mb4;"
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Seed Initial Data
```bash
npm run dev
# Then POST to: http://localhost:3000/api/seed
```

### 5. Login
- URL: http://localhost:3000
- Email: admin@imscampus.lk
- Password: admin123

## Features

- IT Certificate & IT Diploma programs
- 7 branches: Galle, Matara, Nugegoda, Gampaha, Meegoda, Horana, Ratnapura
- Student registration with photo upload
- Daily attendance tracking
- Course payments (6 months x Rs.3,000)
- Exam management with auto-grading
- Repeat exam tracking
- Daily & monthly reports
- Branch-wise analytics
- Certificate eligibility tracking

## Grade System

| Marks | Grade | Class |
|-------|-------|-------|
| 75-100 | A | First Class |
| 65-74 | B+ | Second Upper |
| 55-64 | B | Second Lower |
| 40-54 | C | Pass |
| 0-39 | F | Fail |

## Tech Stack

- Next.js 15 (App Router)
- MySQL 8.0
- Prisma ORM
- Tailwind CSS
- Lucide React Icons
