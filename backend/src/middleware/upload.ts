import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
});

// Single file upload middleware
export const uploadSingle = upload.single('image');

// Multiple files upload middleware
export const uploadMultiple = upload.array('images', 5);

// Image processing middleware
export const processImage = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }

  try {
    // Generate unique filename
    const filename = `${uuidv4()}.webp`;
    const uploadDir = path.join(__dirname, '../../uploads/profile-pictures');
    const filepath = path.join(uploadDir, filename);

    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Process image with sharp
    await sharp(req.file.buffer)
      .resize(800, 800, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(filepath);

    // Add processed file info to request
    req.processedImage = {
      filename,
      path: filepath,
      url: `/uploads/profile-pictures/${filename}`,
      originalName: req.file.originalname,
      size: req.file.size
    };

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process image',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Multiple image processing middleware
export const processImages = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return next();
  }

  try {
    const uploadDir = path.join(__dirname, '../../uploads/profile-pictures');
    await fs.mkdir(uploadDir, { recursive: true });

    const processedImages = [];

    for (const file of req.files) {
      const filename = `${uuidv4()}.webp`;
      const filepath = path.join(uploadDir, filename);

      await sharp(file.buffer)
        .resize(800, 800, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 85 })
        .toFile(filepath);

      processedImages.push({
        filename,
        path: filepath,
        url: `/uploads/profile-pictures/${filename}`,
        originalName: file.originalname,
        size: file.size
      });
    }

    req.processedImages = processedImages;
    next();
  } catch (error) {
    console.error('Image processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process images',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Error handling for multer
export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 images allowed.'
      });
    }
  }

  if (error.message === 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

// Utility function to delete uploaded file
export const deleteUploadedFile = async (filepath: string): Promise<void> => {
  try {
    await fs.unlink(filepath);
  } catch (error) {
    console.error('Error deleting file:', filepath, error);
  }
};

// Extend Request interface for TypeScript
declare global {
  namespace Express {
    interface Request {
      processedImage?: {
        filename: string;
        path: string;
        url: string;
        originalName: string;
        size: number;
      };
      processedImages?: Array<{
        filename: string;
        path: string;
        url: string;
        originalName: string;
        size: number;
      }>;
    }
  }
}
