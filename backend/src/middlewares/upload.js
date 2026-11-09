import multer from 'multer'

const storage = multer.memoryStorage()

// Configure multer for file uploads with memory storage, file size limit, and file type filtering
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Unsupported file type'))
    }
  },
})

export default upload