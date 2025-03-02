import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';

// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Check file type
const checkFileType = (file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp|tiff|bmp|svg|heic|heif|raw|avif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
};

// Init upload without file size limit
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
});

// Image compression middleware - only compress if larger than 2MB
const compressImage = async (req, res, next) => {
    if (!req.file) return next();

    try {
        const filePath = req.file.path;
        const fileSize = req.file.size;
        const TWO_MB = 2 * 1024 * 1024; // 2MB in bytes

        if (fileSize > TWO_MB) {
            const outputPath = filePath;

            await sharp(filePath)
                .jpeg({
                    quality: 90,           // Increased quality to 90
                    progressive: true,
                    mozjpeg: true          // Use mozjpeg for better compression
                })
                .resize(1920, null, {      // Increased max width to 1920px for better quality
                    withoutEnlargement: true,
                    fit: 'inside'
                })
                .toBuffer()
                .then(data => {
                    fs.writeFileSync(outputPath, data);
                    const stats = fs.statSync(outputPath);
                    req.file.size = stats.size;
                });
        }

        next();
    } catch (error) {
        next(error);
    }
};

// Export middlewares
export { upload, compressImage };

// For backward compatibility
export default upload; 