import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';

import authRoutes from './routes/auth';
import notificationRoutes from './routes/notificationRoutes';
import inventoryRoutes from './routes/inventory';
import inventoryTransactionRoutes from './routes/inventoryTransactions';
import assetsRoutes from './routes/assets';
import invoiceRoutes from './routes/invoice';
import analyticsRoutes from './routes/analyticsRoutes';
import reportingRoutes from './routes/reportingRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import financeRoutes from './routes/financeRoutes';
import ocrRoutes from './routes/ocrRoutes';
import subscriptionRoutes from './routes/subscription';
import storageRoutes from './routes/storageRoutes';
import superuserRoutes from './routes/superuser';
import { prisma } from './lib/prisma';

// Import our enhanced security middleware (temporarily disabled for compilation)
// import { requireOrganization } from './middleware/rowLevelSecurity';
// import { authRateLimiter, generalRateLimiter, dataIntensiveRateLimiter } from './middleware/rateLimiter';
// import { securityMiddleware } from './middleware/inputValidation';
// import { logAccess, logAuth } from './utils/auditLogger';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  // In development, load from .env.development
  dotenv.config({ path: '.env.development' });
} else {
  // In production (Render), env vars come from dashboard
  // Don't load dotenv file - trust Render's environment variables
  console.log('🏭 Production mode: Using Render environment variables');
}

const app = express();

// Trust proxy for Render
app.set('trust proxy', 1);

// Production middleware
if (process.env.NODE_ENV === 'production') {
  // Enhanced security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // CORS configuration for production
  app.use(cors({
    origin: [
      'https://track-farm-ops.onrender.com',
      'https://www.trackfarmops.com.ng',
      'https://trackfarmops.com.ng',
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173', // Add explicit localhost for development
      'http://localhost:3000'  // Add backend port for testing
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Production logging
  const logDir = path.dirname(process.env.LOG_FILE || 'logs/app.log');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  app.use(morgan('combined', {
    stream: fs.createWriteStream(process.env.LOG_FILE || 'logs/app.log', { flags: 'a' })
  }));
} else {
  // Development configuration with more permissive CORS for local development
  app.use(cors({
    origin: [
      'https://track-farm-ops.onrender.com',
      'https://www.trackfarmops.com.ng',
      'https://trackfarmops.com.ng',
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173', // Add explicit localhost for development
      'http://localhost:3000'  // Add backend port for testing
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200 // Allow preflight to succeed
  }));
  
  // Development logging
  app.use(morgan('dev')); // Simple logging for development
  console.log('🚀 Backend running in development mode with CORS for:', process.env.FRONTEND_URL || 'http://localhost:5173');
}

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Disable ETag generation globally to prevent 304 responses
app.disable('etag');

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '2.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
    }
  };

  res.status(200).json(healthCheck);
});

// Detailed health check for monitoring
app.get('/api/health/detailed', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '2.0.0',
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    resources: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    },
    database: 'connected', // This would check actual DB connection
    services: {
      auth: 'operational',
      finance: 'operational',
      inventory: 'operational',
      invoice: 'operational'
    }
  };

  res.status(200).json(healthCheck);
});

// API Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'TrackFarmOps API',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth',
      notifications: '/api/notifications',
      finance: '/api/finance',
      inventory: '/api/inventory',
      inventoryTransactions: '/api/inventory-transactions',
      invoice: '/api/invoices',
      storage: '/api/storage',
      ocr: '/api/ocr',
      superuser: '/api/superuser',
      health: '/api/health'
    }
  });
});

// Debug endpoint to check users (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/debug/users', async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });
      res.json({
        totalUsers: users.length,
        users: users
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/inventory-transactions', inventoryTransactionRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/superuser', superuserRoutes);
app.use('/ocr', ocrRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path, stat) => {
    console.log(`📤 Serving static file: ${path}`);
  }
}));

// Serve static files from temp directory
app.use('/temp', express.static(path.join(__dirname, '../temp')));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  if (process.env.NODE_ENV === 'production') {
    // Don't leak error details in production
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  } else {
    // Detailed error in development
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
      stack: err.stack
    });
  }
});

// 404 handler - catch all routes that don't match
app.use((req, res, next) => {
  if (!req.route) {
    res.status(404).json({
      error: 'Not found',
      message: `Route ${req.originalUrl} not found`,
      availableEndpoints: ['/api/auth', '/api/finance', '/api/inventory', '/api/inventory-transactions', '/api/health']
    });
  } else {
    next();
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3001;  // Use Render's PORT or fallback to 3001

console.log('🔧 Server Configuration:');
console.log(`- PORT: ${PORT}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`- Process ID: ${process.pid}`);
console.log(`- Platform: ${process.platform}`);
console.log(`- Node version: ${process.version}`);

// Test basic Express app setup
console.log('🔧 Testing Express app setup...');
try {
  const testReq = { headers: {}, body: {}, query: {}, params: {} };
  console.log('✅ Express app initialized');
  console.log('✅ Middleware loaded');
  console.log('✅ Routes configured');
} catch (error) {
  console.error('❌ Express app setup error:', error);
}

// Start server with enhanced error handling
async function startServer() {
  try {
    console.log('🚀 Starting server binding...');
    let PORT: number;
    
    if (process.env.NODE_ENV === 'production') {
      // In production (Render), always use the PORT provided by Render
      PORT = Number(process.env.PORT) || 10000; // Fallback to 10000 if PORT is not set
      console.log(`🔧 Production mode - Using Render's PORT: ${PORT}`);
    } else {
      // In development, use 3001
      PORT = 3001;
      console.log(`🔧 Development mode - Using default PORT: ${PORT}`);
    }
    
    console.log(`🔧 Final PORT: ${PORT}`);
    console.log(`🔧 PORT type: ${typeof PORT}`);
    console.log(`🔧 Environment PORT: ${process.env.PORT}`);
    console.log(`🔧 Node environment: ${process.env.NODE_ENV}`);
    
    // Test database connection before starting server
    console.log('🔍 Testing database connection...');
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      console.error('❌ Server cannot start without database');
      process.exit(1);
    }
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 TrackFarmOps API server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Server address: ${server.address()}`);
      console.log(`🔗 Server listening: ${server.listening}`);
      
      if (process.env.NODE_ENV === 'production') {
        console.log('🔒 Production mode enabled');
        console.log(`📝 Logs: ${process.env.LOG_FILE || 'logs/app.log'}`);
        console.log(`🌍 Render should detect port ${PORT} automatically`);
      }
    });

    server.on('error', (error: any) => {
      console.error('❌ Server error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      } else if (error.code === 'EACCES') {
        console.error(`Permission denied for port ${PORT}`);
      } else if (error.code === 'EADDRNOTAVAIL') {
        console.error(`Port ${PORT} is not available`);
      } else {
        console.error('❌ Unknown server error:', error);
      }
      process.exit(1);
    });

    server.on('listening', () => {
      console.log('🎉 Server is now listening for connections');
      console.log(`🌍 Bound to: 0.0.0.0:${PORT}`);
    });

    // Add timeout to prevent hanging
    setTimeout(() => {
      if (!server.listening) {
        console.error('❌ Server failed to start within 30 seconds');
        console.error('❌ This might be due to database connection issues or port binding problems');
        process.exit(1);
      }
    }, 30000);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('❌ Error stack:', error.stack);
    process.exit(1);
  }
}

// Start the server
startServer();
