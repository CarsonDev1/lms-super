import express from 'express';
import {
	uploadImage,
	uploadVideo,
	uploadMultipleFiles,
	deleteFile,
	deleteMultipleFiles,
} from '../controllers/uploadController.js';
import { authenticate } from '../middlewares/auth.js';
import {
	uploadImage as uploadImageMiddleware,
	uploadVideo as uploadVideoMiddleware,
	uploadMultiple,
} from '../middlewares/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Upload image (with thumbnails)
router.post('/image', uploadImageMiddleware('image', 'images'), uploadImage);

// Upload video (optimized)
router.post('/video', uploadVideoMiddleware('video', 'videos'), uploadVideo);

// Upload multiple files
router.post('/multiple', uploadMultiple('files', 10, 'files'), uploadMultipleFiles);

// Delete single file
router.delete('/delete', deleteFile);

// Delete multiple files
router.delete('/delete-multiple', deleteMultipleFiles);

export default router;
