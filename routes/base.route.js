import { Router } from 'express';
import { createBase, getBases, getBaseById, updateBase, deleteBase } from '../controllers/base.controller.js';
import authorize from '../middleware/auth.middleware.js';
import { upload, compressImage } from '../middleware/upload.middleware.js';

const baseRouter = Router();

baseRouter.post('/', authorize, upload.single('image'), compressImage, createBase);
baseRouter.get('/', getBases);
baseRouter.get('/:id', getBaseById);
baseRouter.put('/:id', authorize, upload.single('image'), compressImage, updateBase);
baseRouter.delete('/:id', authorize, deleteBase);

export default baseRouter; 