import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * Basic validation result handler
 */
export const handleValidationErrors = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Simple validation - in a real implementation, 
  // you would use express-validator here
  // For now, just pass through to next middleware
  next();
};

/**
 * Simple SQL injection detection
 */
export const detectSQLInjection = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Basic SQL injection detection
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi
  ];

  const checkString = (str: string): boolean => {
    return sqlPatterns.some(pattern => pattern.test(str));
  };

  const hasSQLInjection = 
    checkString(JSON.stringify(req.body)) ||
    checkString(JSON.stringify(req.query));

  if (hasSQLInjection) {
    res.status(400).json({
      error: 'Invalid input detected'
    });
    return;
  }

  next();
};

/**
 * Simple XSS detection
 */
export const detectXSS = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Basic XSS detection
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi
  ];

  const checkString = (str: string): boolean => {
    return xssPatterns.some(pattern => pattern.test(str));
  };

  const hasXSS = 
    checkString(JSON.stringify(req.body)) ||
    checkString(JSON.stringify(req.query));

  if (hasXSS) {
    res.status(400).json({
      error: 'Invalid input detected'
    });
    return;
  }

  next();
};

/**
 * Combined security middleware
 */
export const securityMiddleware = [
  detectSQLInjection,
  detectXSS
];
