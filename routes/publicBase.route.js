import { Router } from 'express';
import { createPublicBase, getPublicBases, getPublicBaseById, updatePublicBase, deletePublicBase } from '../controllers/publicBase.controller.js';
import { upload, compressImage } from '../middleware/upload.middleware.js';
import { clerkMiddleware } from '@clerk/express';

const publicBaseRouter = Router();

// Public routes - accessible to anyone
publicBaseRouter.get('/', getPublicBases);
publicBaseRouter.get('/:id', getPublicBaseById);

// Protected routes - require authentication
publicBaseRouter.post('/', clerkMiddleware(), upload.single('image'), compressImage, createPublicBase);
publicBaseRouter.put('/:id', clerkMiddleware(), upload.single('image'), compressImage, updatePublicBase);
publicBaseRouter.delete('/:id', clerkMiddleware(), deletePublicBase);

export default publicBaseRouter; 