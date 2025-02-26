import { Router } from 'express';
import { signUp, signIn, signOut, verifyToken, getCurrentUser, handleClerkWebhook } from '../controllers/auth.controller.js';
import { requireAuth as clerkRequireAuth } from '@clerk/express';
import { linkClerkUser } from '../middleware/user-linking.middleware.js';

const authRouter = Router();

// Route for user sign-up
authRouter.post('/sign-up', signUp);

// Route for user sign-in
authRouter.post('/sign-in', signIn);

// Route for user sign-out
authRouter.post('/sign-out', signOut);

// Webhook for Clerk events
authRouter.post('/clerk-webhook', handleClerkWebhook);

// Routes that work with either auth system
authRouter.get('/me', 
  // Try Clerk auth first
  linkClerkUser,
  // Try JWT auth next
  (req, res, next) => {
    if (!req.auth?.userId) {
      verifyToken(req, res, next);
    } else {
      next();
    }
  }, 
  getCurrentUser
);

// Clerk-only protected route example
authRouter.get('/clerk-protected', clerkRequireAuth(), (req, res) => {
  res.json({ message: 'This route is protected by Clerk' });
});

export default authRouter;
