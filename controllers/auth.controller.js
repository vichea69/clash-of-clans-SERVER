import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';

// Sign up a new user 
//display token in response 
export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate a JWT token
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({ message: 'User registered successfully', user: newUser, token: token });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Sign in a user
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({ message: 'Login successful', token: token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

// Sign out a user
export const signOut = (req, res) => {
  // Invalidate the token or handle session termination logic
  res.status(200).json({ message: 'Sign out successful', token: null });
};

// Verify token
export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' });
    }

    req.userId = decoded.id;
    next();
  });
};

// Get the current user (works with either JWT or Clerk)
export const getCurrentUser = async (req, res) => {
  try {
    // For Clerk auth
    if (req.auth?.userId) {
      // If user was linked in middleware
      if (req.dbUser) {
        return res.json({ 
          user: req.dbUser,
          authMethod: 'clerk' 
        });
      }
      
      // Otherwise fetch from Clerk directly
      return res.json({ 
        clerkUser: req.auth,
        authMethod: 'clerk' 
      });
    }
    
    // For JWT auth (from your existing verifyToken middleware)
    if (req.userId) {
      const user = await UserModel.findByPk(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.json({ 
        user,
        authMethod: 'jwt' 
      });
    }
    
    return res.status(401).json({ message: 'Not authenticated' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Handle Clerk webhooks
export const handleClerkWebhook = async (req, res) => {
  const evt = req.body;
  
  try {
    // Handle user.created event
    if (evt.type === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const primaryEmail = email_addresses.find(email => email.primary)?.email_address;
      
      if (primaryEmail) {
        // Check if user exists
        const existingUser = await UserModel.findOne({ where: { email: primaryEmail } });
        
        if (existingUser) {
          // Link user
          existingUser.clerk_id = id;
          await existingUser.save();
        } else {
          // Create new user
          await UserModel.create({
            name: `${first_name || ''} ${last_name || ''}`.trim(),
            email: primaryEmail,
            clerk_id: id,
            password: Math.random().toString(36).slice(-10) // Random password
          });
        }
      }
    }
    
    // Handle user.deleted event
    if (evt.type === 'user.deleted') {
      const userId = evt.data.id;
      // Option 1: Delete user from your DB
      // await UserModel.destroy({ where: { clerk_id: userId } });
      
      // Option 2: Unlink user from Clerk
      const user = await UserModel.findOne({ where: { clerk_id: userId } });
      if (user) {
        user.clerk_id = null;
        await user.save();
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  signUp,
  signIn,
  signOut,
  verifyToken,
  getCurrentUser,
  handleClerkWebhook,
};
