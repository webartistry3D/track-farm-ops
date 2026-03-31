import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import fsSync from 'fs';
import { prisma } from '../lib/prisma';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads/profile-images');
    
    // Create directory if it doesn't exist
    if (!fsSync.existsSync(uploadDir)) {
      fsSync.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename without user ID (will be updated later)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Profile image upload endpoint
export const uploadProfileImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.id;
    const filename = req.file.filename;
    const profileImageUrl = `/uploads/profile-images/${filename}`;

    // Update user's profile image URL in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        profileImageUrl: true
      }
    });

    res.json({
      message: 'Profile image uploaded successfully',
      profileImageUrl,
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    
    // Clean up uploaded file if database update fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to clean up file:', unlinkError);
      }
    }

    res.status(500).json({ 
      error: 'Failed to upload profile image',
      details: error.message 
    });
  }
};

// Middleware to handle single file upload
export const uploadProfileImageMiddleware = upload.single('profileImage');
