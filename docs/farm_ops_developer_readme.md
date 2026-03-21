# FarmOps

## Project Overview
FarmOps is a **web-based farm operations management system** built for a livestock and food farm business located in **Owerri, Nigeria**, with the **business owner based in Canada**.

The system enables:
- Local farm workers to **log daily income and expenses** in real time
- Accurate **inventory management** for livestock, feed, produce, and supplies
- A remote business owner to **monitor the entire business from anywhere** via dashboards and reports
- Transparent, auditable records of **all financial and stock movements**

This README is written **for a development agent**, not for marketing. It defines scope, rules, architecture, and success criteria clearly.

---

## Core Problem
The farm currently suffers from:
- Manual or WhatsApp-based record keeping
- No single source of truth for inventory
- Difficulty tracking leakages, losses, or misreporting
- Owner cannot independently verify performance remotely

FarmOps solves this by enforcing **structured data entry**, **role-based access**, and **real-time visibility**.

---

## High-Level Solution
A **mobile-first web application** with:
- React + TypeScript frontend (already initialized with Vite)
- PostgreSQL as the source of truth
- Secure authentication & role-based permissions
- Real-time dashboards and historical reports

---

## Tech Stack (Locked)

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS (preferred)
- React Query or equivalent for data fetching

### Backend
- Node.js (Express)
- TypeScript
- PostgreSQL
- Prisma ORM

### Auth & Security
- JWT-based authentication
- Role-based access control (RBAC)
- Add test user login for admin and staff

### Development and Deployment
- I am currently building the app on my local machine
- I will use postgresql database on my local machine

But for the final deployment, I will use:
- Frontend: Render
- Backend: Render
- Database: Managed PostgreSQL (Neon)

---

## User Roles & Permissions

### 1. Owner (Admin)
- Full read access to all data
- Cannot delete financial records (only flag)
- Can view:
  - Daily / weekly / monthly summaries
  - Profit & loss
  - Inventory levels & movements
  - Worker activity logs

### 2. Manager (Optional, Future)
- Can approve corrections
- Can manage inventory categories

### 3. Worker (Core)
- Can:
  - Log daily income
  - Log daily expenses
  - Update inventory quantities (restricted to assigned categories)
- Cannot:
  - View full financial summaries
  - Edit or delete past records

---

## Core Features (MVP)

### 1. Authentication
- Email + password
- Role assigned at account creation
- Workers cannot self-register

### 2. Income Tracking
Each income entry must include:
- Amount
- Category (e.g. egg sales, chicken sales, crop sales)
- Payment method (cash / transfer)
- Date (default: today)
- Logged-by user ID

### 3. Expense Tracking
Each expense entry must include:
- Amount
- Category (feed, transport, labor, vet, fuel, etc.)
- Optional note
- Date
- Logged-by user ID

### 4. Inventory Management
Inventory types:
- Livestock (e.g. chickens, goats)
- Produce (eggs, crops)
- Consumables (feed, medication)

Inventory rules:
- Every inventory change must be **logged as a transaction**
- No silent updates
- Supports:
  - Add stock
  - Remove stock (sale, spoilage, death)

### 5. Dashboards

#### Owner Dashboard
- Total income (today / week / month)
- Total expenses
- Net profit
- Inventory snapshot
- Charts over time

#### Worker View
- Simple form-based UI
- Today’s submissions summary

---

## Database Design (Initial)

### Users
- id
- name
- email
- role
- created_at

### Income
- id
- amount
- category
- payment_method
- date
- user_id

### Expenses
- id
- amount
- category
- note
- date
- user_id

### InventoryItems
- id
- name
- type
- unit

### InventoryTransactions
- id
- inventory_item_id
- quantity_change (+/-)
- reason
- user_id
- date

---

## Non-Functional Requirements

### Performance
- Must work smoothly on low-end Android phones

### UX
- Mobile-first
- Large buttons
- Minimal typing

### Reliability
- No record deletion (soft delete or flag only)
- Timestamps required for everything

### Security
- Workers only see what they need
- Owner access protected with strong auth

---

## Development Rules (Strict)
- TypeScript everywhere
- No direct SQL queries in controllers
- Validation required for all inputs
- No UI feature without backend support
- No backend endpoint without auth guard
- Add audit & correction flow

---

## Milestones

### Phase 1 – Foundation
- Auth
- Database schema
- Income & expense logging
- Test user login for admin and staff
- Conduct unit testing to validate functionality

### Phase 2 – Inventory
- Inventory models
- Transaction logging
- Inventory UI
- Conduct unit testing to validate functionality

### Phase 3 – Dashboards
- Owner analytics
- Charts & summaries
- Conduct unit testing to validate functionality

### Phase 4 – Deployment
- Production deploy
- Environment config
- Admin account setup
- Conduct unit testing to validate functionality

---

## Success Criteria
- Workers can log data in under 30 seconds per entry
- Owner can audit any day’s activity remotely
- No financial record can disappear without trace
- System usable with poor internet

---

## Project Status
- Frontend: React + TypeScript + Vite **already initialized**
- Database: PostgreSQL **already configured**
- This README is the source of truth for implementation

---

## Important Notes for Dev Agent
- This is **not an accounting app**, keep logic simple
- Accuracy > aesthetics
- Assume users are not tech-savvy
- Optimize for Nigerian network conditions

Build FarmOps like money depends on it — because it does.

