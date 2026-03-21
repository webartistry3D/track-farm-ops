# TrackFarmOps Development Setup

## Quick Start

### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Set up database: Update `.env` with your PostgreSQL credentials
4. Generate Prisma client: `npx prisma generate` (when network is available)
5. Run database migrations: `npx prisma db push`
6. Start development server: `npm run dev`

### Frontend Setup
1. Navigate to root directory: `cd ..`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Test Users
- **Owner**: admin@trackfarmops.com / admin123
- **Worker**: worker@farmops.com / worker123

Create test users by sending POST request to: `POST http://localhost:3001/api/auth/create-test-users`

## API Endpoints
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/finance/income` - Record income
- `POST /api/finance/expenses` - Record expenses
- `GET /api/finance/summary` - Get financial summary (Owner/Manager only)

## Current Status
✅ Backend structure with Node.js + Express + TypeScript
✅ Prisma ORM with PostgreSQL schema
✅ JWT authentication system
✅ Role-based access control
✅ Income & expense tracking endpoints
✅ React frontend with Tailwind CSS
✅ Mobile-first responsive design
✅ Unit testing framework setup

## Next Steps
1. Set up PostgreSQL database locally
2. Generate Prisma client and run migrations
3. Test the application end-to-end
4. Add inventory management features
5. Implement dashboards and reports
