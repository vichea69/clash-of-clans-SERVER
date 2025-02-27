import { Router } from 'express';
import { signUp, signIn, signOut } from '../controllers/auth.controller.js';

const authRouter = Router();

// Route for user sign-up
authRouter.post('/sign-up', signUp);

// Route for user sign-in
authRouter.post('/sign-in', signIn);

// Route for user sign-out
authRouter.post('/sign-out', signOut);



export default authRouter;
