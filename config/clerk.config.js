import { clerkClient } from '@clerk/express';
import { CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY } from './env.js';

// Export Clerk client for use in controllers
export { clerkClient };

// Function to get user from Clerk and sync with database
export const syncClerkUser = async (clerkUserId) => {
  try {
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    return clerkUser;
  } catch (error) {
    console.error('Error fetching Clerk user:', error);
    throw error;
  }
}; 