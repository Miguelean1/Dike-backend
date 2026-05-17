const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    Readable.from(buffer).pipe(stream);
  });

const upload = (folder) => [
  multerUpload.single('image'),
  async (req, res, next) => {
    if (!req.file) return next();
    try {
      req.cloudinaryUrl = await uploadToCloudinary(req.file.buffer, folder);
      next();
    } catch {
      res.status(500).json({ error: 'Image upload failed' });
    }
  },
];

module.exports = upload;
