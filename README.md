# 🚜 Track Farm Ops - Farm Operations Management System

A comprehensive full-stack application for managing farm operations, inventory, finances, and assets.

## 📁 Project Structure

```
track-farm-ops/
├── frontend/                 # React frontend application
│   ├── src/                  # Frontend source code
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.ts        # Vite configuration
│   └── [config files]        # TypeScript, ESLint, Tailwind, etc.
├── backend/                  # Node.js backend API
│   ├── src/                  # Backend source code
│   ├── prisma/               # Database schema and migrations
│   ├── uploads/              # File upload directory
│   ├── package.json          # Backend dependencies
│   └── .env.production       # Production environment variables
├── shared/                   # Shared utilities and test files
│   └── [test scripts]        # Database testing and debugging scripts
├── docs/                     # Documentation
│   └── [markdown files]       # Project documentation
├── package.json              # Workspace configuration
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL database

### Installation
```bash
# Install all dependencies
npm run install:all

# Or install individually
npm run install:frontend
npm run install:backend
```

### Development
```bash
# Start frontend (http://localhost:5173)
npm run dev:frontend

# Start backend (http://localhost:3001)
npm run dev:backend
```

### Production Build
```bash
# Build both applications
npm run build:all

# Build individually
npm run build:frontend
npm run build:backend
```

## 📦 Application Components

### Frontend (React + Vite + TypeScript)
- Modern React 18 with hooks
- TypeScript for type safety
- Tailwind CSS for styling
- Vite for fast development
- React Query for state management

### Backend (Node.js + Express + TypeScript)
- Express.js REST API
- PostgreSQL with Prisma ORM
- JWT authentication
- File upload with S3 storage
- Role-based access control

### Database
- PostgreSQL for production
- Prisma for database management
- Multi-tenant architecture
- Audit logging

## 🔧 Environment Configuration

### Frontend Environment (.env)
```bash
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=FarmOps
VITE_AWS_S3_BUCKET=trackfarmops
# ... other frontend variables
```

### Backend Environment (.env.production)
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
# ... other backend variables
```

## 🚀 Deployment

### Frontend Deployment
1. Build: `npm run build:frontend`
2. Deploy `frontend/dist` folder

### Backend Deployment
1. Build: `npm run build:backend`
2. Set environment variables
3. Deploy `backend/dist` folder

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
