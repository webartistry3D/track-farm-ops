const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/profile-images');
    
    // Create directory if it doesn't exist
    if (!fsSync.existsSync(uploadDir)) {
      fsSync.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + ext);
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
const uploadProfileImage = async (req, res) => {
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
const uploadProfileImageMiddleware = upload.single('profileImage');

module.exports = {
  uploadProfileImage,
  uploadProfileImageMiddleware
};
