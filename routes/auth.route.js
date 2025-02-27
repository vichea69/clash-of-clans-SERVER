import { Router } from 'express';
import { signUp, signIn, signOut, verifyToken, getCurrentUser } from '../controllers/auth.controller.js';

const authRouter = Router();

// Route for user sign-up
authRouter.post('/sign-up', signUp);

// Route for user sign-in
authRouter.post('/sign-in', signIn);

// Route for user sign-out
authRouter.post('/sign-out', signOut);

// Route to get current user
authRouter.get('/me', verifyToken, getCurrentUser);

export default authRouter;
