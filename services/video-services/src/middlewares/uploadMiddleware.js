import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});



const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',  // .mov
  'video/x-msvideo',  // .avi
  'video/x-matroska'  // .mkv
];


const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const MAX_VIDEO_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024; 
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; 


const videoFileFilter = (req, file, cb) => {
  if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid video type. Allowed: ${ALLOWED_VIDEO_TYPES.join(', ')}`), false);
  }
};


const thumbnailFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`), false);
  }
};


const uploadVideoOnly = multer({
  storage: storage,
  fileFilter: videoFileFilter,
  limits: { fileSize: MAX_VIDEO_SIZE }
});


const uploadMultiple = multer({
  storage: storage,
  limits: { fileSize: MAX_VIDEO_SIZE }, 
  fileFilter: (req, file, cb) => {
    
    if (file.fieldname === 'video') {
      if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid video type. Allowed: ${ALLOWED_VIDEO_TYPES.join(', ')}`), false);
      }
    }
    
    else if (file.fieldname === 'thumbnail') {
      if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`), false);
      }
    }

    else {
      cb(new Error(`Unexpected field: ${file.fieldname}`), false);
    }
  }
});


export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum video size is ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`
      });
    }
    
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

export const uploadSingle = uploadVideoOnly.single('video');


export const uploadWithThumbnail = uploadMultiple.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);
