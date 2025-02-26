import UserModel from '../models/user.model.js';
import { clerkClient } from '../config/clerk.config.js';

// Middleware to link Clerk users with your database
export const linkClerkUser = async (req, res, next) => {
  try {
    // Skip if no Clerk authentication
    if (!req.auth?.userId) {
      return next();
    }

    const clerkUserId = req.auth.userId;
    
    // Check if user exists in your database with clerk_id
    let user = await UserModel.findOne({ where: { clerk_id: clerkUserId } });
    
    // If user doesn't exist, create or link one
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      
      if (email) {
        // Check if user exists with this email
        const existingUser = await UserModel.findOne({ where: { email } });
        
        if (existingUser) {
          // Link existing user with Clerk ID
          existingUser.clerk_id = clerkUserId;
          await existingUser.save();
          user = existingUser;
        } else {
          // Create new user
          user = await UserModel.create({
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            email,
            clerk_id: clerkUserId,
            // Generate a random password since they'll use Clerk authentication
            password: Math.random().toString(36).slice(-10)
          });
        }
      }
    }
    
    // Add user to request object
    req.dbUser = user;
    next();
  } catch (error) {
    console.error('Error in linkClerkUser middleware:', error);
    next();
  }
}; 