import { Router } from 'express';
import { createPublicBase, getPublicBases, getPublicBaseById, updatePublicBase, deletePublicBase } from '../controllers/publicBase.controller.js';
import upload from '../middleware/upload.middleware.js';
import { requireAuth } from '@clerk/express';

const publicBaseRouter = Router();

// Public routes - accessible to anyone
publicBaseRouter.get('/', getPublicBases);
publicBaseRouter.get('/:id', getPublicBaseById);

// Protected routes - require authentication
publicBaseRouter.post('/', requireAuth(), upload.single('image'), createPublicBase);
publicBaseRouter.put('/:id', requireAuth(), upload.single('image'), updatePublicBase);
publicBaseRouter.delete('/:id', requireAuth(), deletePublicBase);

export default publicBaseRouter; 