import express from 'express';
import { protect } from '../middleware/auth.js';
import parser from '../middleware/uploadMiddleware.js'; // Use the configured Cloudinary parser

const router = express.Router();

router.post('/', protect, parser.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // multer-storage-cloudinary provides the file URL in `req.files[n].path`
    const urls = req.files.map((file) => file.path);

    res.json({ urls });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

export default router;
